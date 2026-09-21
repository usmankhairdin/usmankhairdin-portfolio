
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Mock data for specific dates
const mealDates = {
  "2025-05-01": [
    { timing: "pre", title: "Oatmeal & Banana" },
    { timing: "post", title: "Protein Smoothie" }
  ],
  "2025-05-02": [
    { timing: "during", title: "Energy Gel" },
    { timing: "post", title: "Chicken & Rice Bowl" }
  ],
  "2025-05-03": [
    { timing: "pre", title: "Toast & Eggs" }
  ]
};

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  // Function to get meals for selected date
  const getMealsForDate = (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    return mealDates[dateKey as keyof typeof mealDates] || [];
  };
  
  const selectedDateMeals = getMealsForDate(date);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nutrition Calendar</h1>
        <p className="text-gray-500">Track your meals over time</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="mx-auto"
          modifiers={{
            highlighted: (date) => {
              const dateKey = date.toISOString().split("T")[0];
              return dateKey in mealDates;
            }
          }}
          modifiersClassNames={{
            highlighted: "bg-szalty-lightBlue text-szalty-blue font-medium"
          }}
        />
      </div>
      
      <div className="mb-6">
        <h2 className="font-medium text-lg mb-2">
          {date.toLocaleDateString("en-US", { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        
        {selectedDateMeals.length > 0 ? (
          <div className="space-y-3">
            {selectedDateMeals.map((meal, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={cn(
                  "h-2",
                  meal.timing === "pre" ? "bg-szalty-blue" :
                  meal.timing === "during" ? "bg-szalty-yellow" : "bg-szalty-orange"
                )} />
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{meal.title}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "mt-1",
                        meal.timing === "pre" ? "text-szalty-blue" :
                        meal.timing === "during" ? "text-black" : "text-szalty-orange"
                      )}
                    >
                      {meal.timing === "pre" ? "Pre-Workout" : 
                       meal.timing === "during" ? "During Workout" : "Post-Workout"}
                    </Badge>
                  </div>
                  <button className="text-gray-400 hover:text-szalty-blue">
                    View
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-szalty-gray rounded-lg p-6 text-center">
            <p className="text-gray-500">No meals recorded for this date</p>
            <button className="text-szalty-blue font-medium mt-2">Add a meal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
