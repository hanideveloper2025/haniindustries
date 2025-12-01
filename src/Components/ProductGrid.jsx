import ProductCard from "./ProductCard"
import "./ProductGrid.css"

function ProductGrid({ products, title, columns = 4 }) {
  return (
    <section className="product-grid-section">
      <div className="product-grid-container">
        {title && <h2 className="grid-title">{title}</h2>}
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductGrid
