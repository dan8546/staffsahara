import { Hero } from "@/components/Hero";
import { Seo } from "@/components/Seo";

const Index = () => {
  return (
    <>
      <Seo />
      <main className="min-h-screen">
        <Hero />
      </main>
    </>
  );
};

export default Index;
