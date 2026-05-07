import {
  User,
  Sparkle,
  Shirt,
  Sparkles,
  RefreshCcw,
  Smile,
  Briefcase,
  SportShoe,
  CloudSun,
  Sun,
  ThermometerSun,
  Snowflake,
  WandSparkles,
  Camera,
  Image,
  Trash2,
  Recycle,
  Search,
  FolderClosed,
  Hand,
} from "lucide-react-native";

import { Icon } from "lucide-react-native";
import { jacket, shirtFoldedButtons, wardrobe } from "@lucide/lab";

interface TabIconProps {
  name: string;
  color: string;
  size: number;
}

export function IconComponent({ name, color, size }: TabIconProps) {
  const props = { size, color, strokeWidth: 1.5 };

  if (name === "wardrobe") return <Icon iconNode={wardrobe} {...props} />;
  if (name === "generate") return <Sparkle {...props} />;
  if (name === "generate-off") return <Hand {...props} color="#8E8E93" />;
  if (name === "profile") return <User {...props} />;
  if (name === "sparkles") return <Sparkles {...props} />;
  if (name === "refresh") return <RefreshCcw {...props} />;
  if (name === "casual") return <Smile {...props} />;
  if (name === "work") return <Briefcase {...props} />;
  if (name === "sport") return <SportShoe {...props} />;
  if (name === "formal") return <Icon iconNode={jacket} {...props} />;
  if (name === "any") return <Sun {...props} />;
  if (name === "hot") return <ThermometerSun {...props} />;
  if (name === "mild") return <CloudSun {...props} />;
  if (name === "cold") return <Snowflake {...props} />;
  if (name === "wand") return <WandSparkles {...props} />;
  if (name === "shirt")
    return <Icon iconNode={shirtFoldedButtons} {...props} />;
  if (name === "camera") return <Camera {...props} />;
  if (name === "image") return <Image {...props} />;
  if (name === "trash") return <Trash2 {...props} />;
  if (name === "recycle") return <Recycle {...props} />;
  if (name === "search") return <Search {...props} />;
  if (name === "folderClosed") return <FolderClosed {...props} />;
  return <Shirt {...props} />;
}
