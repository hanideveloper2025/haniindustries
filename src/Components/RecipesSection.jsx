import "./RecipesSection.css"

function RecipesSection() {
  return (
    <section className="recipes-section">
      <div className="recipes-container">
        <div className="recipes-image">
          <img src="/delicious-recipes-food-cooking.jpg" alt="Delicious Recipes" className="recipe-img" />
        </div>
        <div className="recipes-content">
          <h2>Delicious</h2>
          <h3>Recipes</h3>
          <p>
            Discover mouth-watering recipes using our premium oils and spices. From traditional dishes to modern
            cuisine, find the perfect recipe to elevate your cooking.
          </p>
          <button className="recipes-btn">Explore Recipes</button>
        </div>
      </div>
    </section>
  )
}

export default RecipesSection
