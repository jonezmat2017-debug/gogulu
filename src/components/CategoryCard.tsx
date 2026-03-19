import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  color: string;
}

const CategoryCard = ({ icon: Icon, title, count, color }: CategoryCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="p-8 space-y-4 relative">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground mt-2">
            {count}+ places
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;