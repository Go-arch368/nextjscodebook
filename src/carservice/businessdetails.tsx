
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Share2, Pencil, ThumbsUp, MapPin, Phone, MessageSquare, MessageCircle, Check } from "lucide-react";

export function BusinessCard({ business }) {
 
  if (!business) {
    return <div>Error: Business data is missing</div>;
  }

  const randomizeLastDigit = (id) => {
    const randomDigit = Math.floor(Math.random() * 10); 
    return id.slice(0, -1) + randomDigit;
  };

  const businessId = business.businessId ? randomizeLastDigit(business.businessId) : "12345670";

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm relative mx-auto">
     
      <div className="absolute right-4 top-4 flex gap-2">
        {business.services.map((service, index) => (
          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-800">
            {service}
          </Badge>
        ))}
        <button className="border p-1 rounded-md text-gray-600 hover:bg-gray-100">
          <Check className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
     
        <div className="flex items-start gap-4">
        
          {business.image && (
            <img
              src={business.image}
              alt={`${business.name} logo`}
              className="w-20 h-20 rounded-md object-cover"
            />
          )}

     
          <div className="flex-1">
            
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-gray-600" />
              {business.name}
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-600 text-white px-2 py-0.5 text-sm">
                {business.rating}
              </Badge>
              <span className="text-sm text-gray-700">
                {business.total_ratings} Ratings
              </span>
              {business.badges.includes("Trust") && (
                <Badge className="bg-yellow-400 text-black text-xs">Trust</Badge>
              )}
              {business.badges.includes("Verified") && (
                <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
              )}
              {business.badges.includes("Claimed") && (
                <Badge className="bg-black text-white text-xs">Claimed</Badge>
              )}
            </div>

        
            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-600" />
                {business.location}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-semibold">{business.hours.status}</span>
              <span className="text-gray-400">•</span>
              <span>{business.years_in_business}</span>
              <span className="text-gray-400">•</span>
              <span>ID: {businessId}</span>
              <span className="text-gray-400">•</span>
              <span className="text-red-500 font-medium">"{business.booking_info}"</span>
              <span className="text-gray-400">•</span>
              <span className="text-black">5 Suggestions</span>
            </div>

     
            <div className="flex justify-start gap-3 mt-2 flex-wrap">
            
              <div className="flex items-center space-x-2">
                {business.contact.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.type === "primary" ? "default" : "outline"}
                    className={
                      action.type === "primary"
                        ? action.label === "Call"
                          ? "bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
                          : "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                        : action.label === "WhatsApp"
                        ? "border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 text-lg"
                        : ""
                    }
                  >
                    {action.icon && (
                      <span className="w-6 h-6 mr-2">
                        {action.icon === "Phone" ? (
                          <Phone className="w-6 h-6" />
                        ) : action.icon === "MessageSquare" ? (
                          <MessageSquare className="w-6 h-6" />
                        ) : action.icon === "MessageCircle" ? (
                          <MessageCircle className="w-6 h-6" />
                        ) : (
                          action.icon
                        )}
                      </span>
                    )}
                    <span className="truncate">
                      {action.label === "Call" ? business.contact.phone : action.label}
                    </span>
                  </Button>
                ))}
            
                <Button
                  variant="outline"
                  className="border border-gray-300 px-6 py-3 text-lg hover:bg-gray-100"
                >
                  <Share2 className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  className="border border-gray-300 px-6 py-3 text-lg hover:bg-gray-100"
                >
                  <Pencil className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex justify-end items-center mt-3 gap-2">
        <span className="text-sm font-medium text-gray-700">Click to Rate</span>
        {[...Array(5)].map((_, idx) => (
          <Star
            key={idx}
            className="w-5 h-5 text-gray-400 hover:text-yellow-400 cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
}

export default BusinessCard;