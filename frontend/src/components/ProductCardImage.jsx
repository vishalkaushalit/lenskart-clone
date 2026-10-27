import "./ProductCardImage.css";

// Shared image area for collection, similar-product and wishlist cards.
export default function ProductCardImage({ src, alt }) {
  return (
    <div className="product-card-media">
      <img
        className="product-card-media-image"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={800}
        height={500}
      />
    </div>
  );
}
