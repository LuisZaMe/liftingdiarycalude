"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarClientProps {
  selectedDate: Date;
}

function formatDateToParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarClient({ selectedDate }: CalendarClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // The selected date comes from the server as a prop rather than being
  // re-derived from useSearchParams(), so the calendar and the workout list
  // can never disagree about which day is showing.
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    router.push(`/dashboard?date=${formatDateToParam(date)}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, "do MMM yyyy")}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
