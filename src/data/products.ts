export interface Product {
  name: string;
  desc: string;
  position: [number, number, number];
}

export const PRODUCTS: Product[] = [
  {
    name: "Content Creation",
    desc: "Strategic multimedia content pipelines for audience engagement and brand authority.",
    position: [-1.8, -1.4, 1.0],
  },
  {
    name: "Animation",
    desc: "Cinematic motion design and visual storytelling at production scale.",
    position: [0, -1.4, 2.0],
  },
  {
    name: "Explainer",
    desc: "Complex-to-clear explainer videos that drive understanding and conversion.",
    position: [1.8, -1.4, 1.0],
  },
];
