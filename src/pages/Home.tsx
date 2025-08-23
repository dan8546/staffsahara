import { Hero } from "@/components/Hero";
import { Seo } from "@/components/Seo";

const Home = () => {
  return (
    <>
      <Seo />
      <main className="min-h-screen">
        <Hero />
      </main>
    </>
  );
};

export default Home;