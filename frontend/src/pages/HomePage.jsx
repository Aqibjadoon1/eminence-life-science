import { Helmet } from 'react-helmet-async';
import HeroSection        from '../components/page-sections/home/HeroSection.jsx';
import TrustStrip         from '../components/page-sections/home/TrustStrip.jsx';
import TopPicksSection    from '../components/page-sections/home/TopPicksSection.jsx';
import PromoBannerPair    from '../components/page-sections/home/PromoBannerPair.jsx';
import DealCountdownSection from '../components/page-sections/home/DealCountdownSection.jsx';
import NewsletterSection  from '../components/page-sections/home/NewsletterSection.jsx';
import LifestyleStrip     from '../components/page-sections/home/LifestyleStrip.jsx';
import FeatureIconsRow    from '../components/page-sections/home/FeatureIconsRow.jsx';
import ScienceSection     from '../components/page-sections/home/ScienceSection.jsx';
import ConcernTiles       from '../components/page-sections/home/ConcernTiles.jsx';
import Testimonials       from '../components/page-sections/home/Testimonials.jsx';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Eminence Life Science — Premium Skincare</title>
        <meta
          name="description"
          content="Dermatologist-formulated serums, medicated bars, face washes, and emollients. Clean actives, clinical results. Made in Pakistan."
        />
      </Helmet>

      {/* 1. Hero slider */}
      <HeroSection />

      {/* 2. Trust marquee */}
      <TrustStrip />

      {/* 3. Top Pick of the Month — 3 product cards */}
      <TopPicksSection />

      {/* 4. Two promo tiles side by side */}
      <PromoBannerPair />

      {/* 5. Limited time deal — countdown + 6 product grid */}
      <DealCountdownSection />

      {/* 6. Newsletter — inline, above the fold */}
      <NewsletterSection />

      {/* 7. The Science split section */}
      <ScienceSection />

      {/* 8. Shop by category tiles */}
      <ConcernTiles />

      {/* 9. Lifestyle image strip */}
      <LifestyleStrip />

      {/* 10. Feature icons row */}
      <FeatureIconsRow />

      {/* 11. Testimonials */}
      <Testimonials />
    </>
  );
}
