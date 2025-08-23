import { Hero } from "@/components/Hero";
import { Seo } from "@/components/Seo";
import { useTranslation } from "react-i18next";
import { useSession } from "@/stores/useSession";

const Home = () => {
  const { t } = useTranslation();
  const { user } = useSession();

  return (
    <>
      <Seo />
      {!user && (
        <div className="bg-brand-blue/5 border-b border-brand-blue/10 py-2">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-brand-blue">
              {t('public.banner')}
            </p>
          </div>
        </div>
      )}
      <main className="min-h-screen">
        <Hero />
      </main>
    </>
  );
};

export default Home;