import {
  Home,
  User,
  Sparkle,
  Shirt,
  LayoutGrid,
  Sparkles,
  RefreshCcw,
  Smile,
} from "lucide-react-native";

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export function IconComponent({ name, color, size }: TabIconProps) {
  const props = { size, color, strokeWidth: 1.5 };

  if (name === "wardrobe") return <Shirt {...props} />;
  if (name === "generate") return <Sparkle {...props} />;
  if (name === "profile") return <User {...props} />;
  if (name === "sparkles") return <Sparkles {...props} />;
  if (name === "refresh") return <RefreshCcw {...props} />;
  if (name === "smile") return <Smile {...props} />;
  return <LayoutGrid {...props} />;
}
