import { motion } from "framer-motion";

export default function More() {
  return (
    <div className="flex items-center justify-center h-screen">
      <motion.div
        className="bg-blue-500 flex items-center justify-center h-64 w-64 text-white text-2xl font-bold rounded-xl"

        drag
      >
        hi
      </motion.div>
      <motion.img src="https://static.vecteezy.com/system/resources/previews/001/193/929/non_2x/vintage-car-png.png" className="w-120 h-60" animate={{
        x: [-1000, -500, 500],
        y: [0, 0, 200, 200],
      }}

      transition={{
        duration: 5,
        delay: 1,
        repeat: 1,
      }}
      
      alt="" />
    </div>
  );
}
