import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MapPin, Phone, Mail, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import VenueReviews from "@/components/VenueReviews";
import VenueMenu from "@/components/VenueMenu";

interface Venue {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  review_count: number;
  location: string;
  address: string;
  phone: string | null;
  email: string | null;
  price_level: number;
  is_open: boolean;
  featured: boolean;
  image_url: string | null;
  opening_hours: string | null;
}

interface VenueDetailsDialogProps {
  venue: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VenueDetailsDialog = ({ venue, open, onOpenChange }: VenueDetailsDialogProps) => {
  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{venue.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {venue.image_url && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg">
              <img
                src={venue.image_url}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
              {venue.featured && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
                  Featured
                </Badge>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {venue.category}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-accent text-accent" />
                <span className="font-semibold">{venue.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({venue.review_count} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {'$'.repeat(venue.price_level)}
                </span>
              </div>
              <Badge 
                variant={venue.is_open ? "default" : "destructive"}
                className={venue.is_open ? "bg-secondary text-secondary-foreground" : ""}
              >
                {venue.is_open ? 'Open Now' : 'Closed'}
              </Badge>
            </div>

            {venue.description && (
              <>
                <Separator />
                <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{venue.address}</p>
                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                </div>
              </div>

              {(venue.phone || venue.email) && (
                <div className="flex items-center gap-4 flex-wrap">
                  {venue.phone && (
                    <a 
                      href={`tel:${venue.phone}`}
                      className="flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {venue.phone}
                    </a>
                  )}
                  {venue.email && (
                    <a 
                      href={`mailto:${venue.email}`}
                      className="flex items-center gap-2 text-primary hover:underline font-medium text-sm truncate max-w-[220px] sm:max-w-none"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      {venue.email}
                    </a>
                  )}
                </div>
              )}

              {venue.opening_hours && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="font-medium">{venue.opening_hours}</p>
                </div>
              )}
            </div>

            <Separator />

            <VenueMenu venueId={venue.id} venuePhone={venue.phone} venueName={venue.name} />

            <Separator />

            <VenueReviews venueId={venue.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenueDetailsDialog;
