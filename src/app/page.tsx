import Navbar from "@/components/Navigation/Navbar";
import CTAHOME from "@/components/Pages/Home/CallToAction/CTA-HOME";
import Features from "@/components/Pages/Home/Features/Features";
import Footer from "@/components/Navigation/Footer";

export default async function Home() {
  return (
    <>
      <Navbar />
      <CTAHOME />
      <Features />
      <Footer />
    </>
  );
}
