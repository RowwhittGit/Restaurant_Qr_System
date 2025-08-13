import { useEffect, useState } from "react";
import axios from "axios";

interface MenuItem {
  id: number;
  image: string;
  name: string;
  price: number;
}

function Home() {
  const [menu, setMenu] = useState<MenuItem[] | null>(null);
  
  useEffect(() => {
    const getMenu = async () => {
      try {
        const response = await axios.get<{data: MenuItem[]}>('http://localhost:3000/api/menu/');
        setMenu(response.data.data);
        console.log('Menu fetched successfully:', response.data);
      } catch (error) {
        console.log('Error fetching menu:', error);
      }
    };
    getMenu();
  }, []);

  return (
    <div>
      {menu && menu.map((item) => (
        <div key={item.id}>
          <img src={item.image} alt={item.name} className="w-32 h-32 object-cover" />
          <div>{item.name}</div>
          <div>${item.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

export default Home;