// Utilitaires de conformité et scoring
interface TalentCertificate {
  course_code: string;
  issued_at: string;
  expires_at?: string;
  issuer: string;
}

interface CoverageResult {
  coverage: number; // Pourcentage de couverture 0-100
  expiresSoon: boolean; // Au moins un certificat expire dans 60 jours
  expiringSoonCount: number;
  rmtcRecentCount: number; // Nombre de certificats RMTC récents (< 2 ans)
  missingCerts: string[];
  validCerts: string[];
}

/**
 * Calcule la couverture de conformité d'un talent
 * @param talentCerts - Certificats du talent
 * @param requiredCodes - Codes de certification requis
 * @returns Résultat de la couverture
 */
export function computeCoverage(
  talentCerts: TalentCertificate[], 
  requiredCodes: string[]
): CoverageResult {
  if (requiredCodes.length === 0) {
    return {
      coverage: 100,
      expiresSoon: false,
      expiringSoonCount: 0,
      rmtcRecentCount: 0,
      missingCerts: [],
      validCerts: []
    };
  }

  const now = new Date();
  const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const twoYearsAgo = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);

  // Grouper les certificats par code
  const certsByCode = new Map<string, TalentCertificate[]>();
  talentCerts.forEach(cert => {
    const code = cert.course_code.toUpperCase();
    if (!certsByCode.has(code)) {
      certsByCode.set(code, []);
    }
    certsByCode.get(code)!.push(cert);
  });

  const validCerts: string[] = [];
  const missingCerts: string[] = [];
  let expiringSoonCount = 0;
  let rmtcRecentCount = 0;

  // Vérifier chaque certification requise
  requiredCodes.forEach(requiredCode => {
    const code = requiredCode.toUpperCase();
    const certs = certsByCode.get(code) || [];
    
    // Trouver le certificat le plus récent et valide
    const validCert = certs
      .filter(cert => {
        // Vérifier si le certificat n'est pas expiré
        if (cert.expires_at) {
          return new Date(cert.expires_at) > now;
        }
        return true; // Pas d'expiration = valide
      })
      .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())[0];

    if (validCert) {
      validCerts.push(code);
      
      // Vérifier si expire bientôt
      if (validCert.expires_at && new Date(validCert.expires_at) <= sixtyDaysFromNow) {
        expiringSoonCount++;
      }
      
      // Vérifier si c'est un certificat RMTC récent
      if (validCert.issuer === 'RMTC' && new Date(validCert.issued_at) >= twoYearsAgo) {
        rmtcRecentCount++;
      }
    } else {
      missingCerts.push(code);
    }
  });

  const coverage = (validCerts.length / requiredCodes.length) * 100;
  const expiresSoon = expiringSoonCount > 0;

  return {
    coverage,
    expiresSoon,
    expiringSoonCount,
    rmtcRecentCount,
    missingCerts,
    validCerts
  };
}

/**
 * Calcule le score de recrutement basé sur la conformité
 * @param coverageResult - Résultat de la couverture
 * @returns Score de conformité (0-50 points)
 */
export function calculateComplianceScore(coverageResult: CoverageResult): number {
  let score = 0;
  
  // +30 points si couverture complète
  if (coverageResult.coverage === 100) {
    score += 30;
  }
  
  // +10 points si pas de certificat expirant bientôt
  if (!coverageResult.expiresSoon) {
    score += 10;
  }
  
  // +10 points par certificat RMTC récent (max 10 points)
  score += Math.min(coverageResult.rmtcRecentCount * 10, 10);
  
  return score;
}

/**
 * Met à jour le score d'une application
 * @param baseScore - Score de base de l'application
 * @param coverageResult - Résultat de la couverture
 * @returns Nouveau score total
 */
export function updateApplicationScore(
  baseScore: number, 
  coverageResult: CoverageResult
): number {
  const complianceScore = calculateComplianceScore(coverageResult);
  return baseScore + complianceScore;
}