import Hero from "./Hero"
import FeaturedProducts from "./FeatureProducts"
import WhyChooseUs from "./WhyChooseUs"
import RecipesSection from "./RecipesSection"
import NewsletterSignup from "./NewsletterSignup"

function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <FeaturedProducts />
      <WhyChooseUs />
      <RecipesSection />
      <NewsletterSignup />
    </div>
  )
}

export default HomePage
