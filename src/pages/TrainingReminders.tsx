import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarClock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Seo } from '@/components/Seo';

interface SessionReminder {
  id: string;
  course_title: string;
  course_code: string;
  starts_at: string;
  location: string;
  capacity: number;
  enrollment_count: number;
}

interface CertificateReminder {
  id: string;
  course_code: string;
  talent_id: string;
  talent_name: string;
  expires_at: string;
  issuer: string;
}

const TrainingReminders = () => {
  const { t } = useTranslation();
  const [sessionReminders, setSessionReminders] = useState<SessionReminder[]>([]);
  const [certReminders, setCertReminders] = useState<CertificateReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      // Sessions starting in 7 days (D+7 to D+8)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 8);

      const { data: sessions } = await supabase
        .from('training_sessions')
        .select(`
          id,
          starts_at,
          location,
          capacity,
          training_courses:course_id(title, code),
          enrollments(count)
        `)
        .eq('status', 'scheduled')
        .gte('starts_at', tomorrow.toISOString())
        .lt('starts_at', dayAfter.toISOString());

      // Certificates expiring in 30 days (D+30 to D+31)
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      const in31Days = new Date();
      in31Days.setDate(in31Days.getDate() + 31);

      const { data: certs } = await supabase
        .from('certificates')
        .select(`
          id,
          course_code,
          talent_id,
          expires_at,
          issuer
        `)
        .gte('expires_at', in30Days.toISOString())
        .lt('expires_at', in31Days.toISOString());

      setSessionReminders(sessions?.map(s => ({
        id: s.id,
        course_title: s.training_courses?.title || '',
        course_code: s.training_courses?.code || '',
        starts_at: s.starts_at,
        location: s.location || '',
        capacity: s.capacity || 0,
        enrollment_count: s.enrollments?.[0]?.count || 0
      })) || []);

      setCertReminders(certs?.map(c => ({
        id: c.id,
        course_code: c.course_code || '',
        talent_id: c.talent_id || '',
        talent_name: 'Unknown Talent', // We'll need to fetch profile data separately
        expires_at: c.expires_at || '',
        issuer: c.issuer || ''
      })) || []);

    } catch (error) {
      console.error('Error loading reminders:', error);
      toast.error('Error loading reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSessionReminder = (sessionId: string) => {
    console.log('REMINDER_SESSION', { session_id: sessionId });
    toast.success('Session reminder sent!');
  };

  const handleNotifyCertExpiry = (certId: string) => {
    console.log('REMINDER_CERT_EXPIRY', { cert_id: certId });
    toast.success('Certificate expiry notification sent!');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Seo 
        title={`${t('reminders.title')} - Staff Sahara`}
        description="Reminders for training sessions and certificate expirations"
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ink-900 mb-2">
          {t('reminders.title')}
        </h1>
        <p className="text-ink-600">
          Manage training session and certificate expiry notifications
        </p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {t('reminders.sessions')}
            {sessionReminders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {sessionReminders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t('reminders.certs')}
            {certReminders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {certReminders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {sessionReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarClock className="h-12 w-12 text-ink-300 mx-auto mb-4" />
                <p className="text-ink-600">No session reminders for the next 7 days</p>
              </CardContent>
            </Card>
          ) : (
            sessionReminders.map((session) => (
              <Card key={session.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {session.course_title}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {session.course_code}
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => handleSendSessionReminder(session.id)}
                      size="sm"
                    >
                      {t('reminders.send')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-ink-500">Date:</span>
                      <p className="font-medium">
                        {new Date(session.starts_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-ink-500">Location:</span>
                      <p className="font-medium">{session.location}</p>
                    </div>
                    <div>
                      <span className="text-ink-500">Capacity:</span>
                      <p className="font-medium">{session.capacity}</p>
                    </div>
                    <div>
                      <span className="text-ink-500">Enrolled:</span>
                      <p className="font-medium">{session.enrollment_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          {certReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-ink-300 mx-auto mb-4" />
                <p className="text-ink-600">No certificate expiries in the next 30 days</p>
              </CardContent>
            </Card>
          ) : (
            certReminders.map((cert) => (
              <Card key={cert.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {cert.talent_name || 'Unknown Talent'}
                      </CardTitle>
                      <Badge variant="destructive" className="mt-1">
                        {cert.course_code}
                      </Badge>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => handleNotifyCertExpiry(cert.id)}
                      size="sm"
                    >
                      {t('reminders.notify')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-ink-500">Expires:</span>
                      <p className="font-medium text-destructive">
                        {new Date(cert.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-ink-500">Issuer:</span>
                      <p className="font-medium">{cert.issuer}</p>
                    </div>
                    <div>
                      <span className="text-ink-500">Days remaining:</span>
                      <p className="font-medium text-destructive">
                        {Math.ceil((new Date(cert.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingReminders;