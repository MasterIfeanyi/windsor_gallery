// Cloudinary resizes images through the web address. We add instructions
// after "/upload/": c_limit never enlarges, w_ sets the width, f_auto picks
// the lightest format the browser supports, q_auto picks a good quality.
export const buildImageUrl = (url, width) =>
  url.replace('/upload/', `/upload/c_limit,w_${width},f_auto,q_auto/`)

// Offers the browser three sizes and lets it pick. A phone downloads the
// small one, a big screen downloads the big one.
export const buildSrcSet = (url, widths = [400, 800, 1200]) =>
  widths.map((width) => `${buildImageUrl(url, width)} ${width}w`).join(', ')
