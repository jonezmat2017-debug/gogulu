import { useState } from "react";
import { Star, MapPin, DollarSign, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatDialog from "@/components/ChatDialog";

interface VenueCardProps {
  id?: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  priceLevel: number;
  image: string;
  isOpen: boolean;
  featured?: boolean;
  ownerId?: string;
  onClick?: () => void;
}

const VenueCard = ({
  id,
  name,
  category,
  rating,
  reviews,
  location,
  priceLevel,
  image,
  isOpen,
  featured = false,
  ownerId,
  onClick,
}: VenueCardProps) => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Card 
        className="group overflow-hidden border-border hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.25)] cursor-pointer rounded-2xl"
        onClick={onClick}
      >
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {featured && (
            <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-lg border-0">
              ★ Featured
            </Badge>
          )}
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl font-medium text-xs backdrop-blur-md ${
            isOpen 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-destructive/20 text-red-300 border border-destructive/30'
          }`}>
            {isOpen ? '● Open Now' : '● Closed'}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-white text-sm">{rating.toFixed(1)}</span>
                <span className="text-white/70 text-xs">({reviews})</span>
              </div>
              <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/80">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs font-medium">{'$'.repeat(priceLevel)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-muted-foreground text-sm mt-0.5">{category}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>
            {ownerId && (
              <button
                onClick={(e) => { e.stopPropagation(); setChatOpen(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </button>
            )}
          </div>
        </div>
      </Card>

      {ownerId && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          recipientId={ownerId}
          recipientName={name}
          contextType="venue"
          contextId={id}
        />
      )}
    </>
  );
};

export default VenueCard;
