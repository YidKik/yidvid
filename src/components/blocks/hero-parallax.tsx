
"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  thumbnail: string;
}

export const HeroParallax = ({
  products
}: {
  products: Product[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yFirst = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const ySecond = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const yThird = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden bg-black antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header />
      <motion.div
        style={{ y: yFirst }}
        className="relative mt-80 flex space-x-4 justify-center"
      >
        {firstRow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
      <motion.div
        style={{ y: ySecond }}
        className="relative mt-4 flex space-x-4 justify-center"
      >
        {secondRow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
      <motion.div
        style={{ y: yThird }}
        className="relative mt-4 flex space-x-4 justify-center"
      >
        {thirdRow.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Link
      to={`/video/${product.id}`}
      className="group/product h-96 w-[30rem] relative flex-shrink-0 rounded-xl overflow-hidden bg-zinc-800"
    >
      <img
        src={product.thumbnail}
        alt={product.title}
        className="object-cover absolute inset-0 h-full w-full group-hover/product:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black transition-opacity duration-500" />
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 transition-opacity duration-500 text-white font-bold text-2xl">
        {product.title}
      </h2>
    </Link>
  );
};

const Header = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold text-white">
        Discover Amazing <br /> Jewish Content
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 text-zinc-300">
        Explore a curated collection of inspiring videos from the best Jewish content creators.
      </p>
    </div>
  );
};
