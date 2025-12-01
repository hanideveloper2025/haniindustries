import ProductCard from "./ProductCard"
import "./RelatedProducts.css"

function RelatedProducts({ products }) {
  return (
    <section className="related-products-section">
      <div className="related-products-container">
        <h2>Related Products</h2>
        <div className="related-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts
