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
import { parseDateParam, formatDateParam } from "@/lib/date-param";

interface CalendarClientProps {
  selectedDate: string;
}

export function CalendarClient({ selectedDate }: CalendarClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // The selected day arrives as a plain "yyyy-MM-dd" string rather than a Date.
  // A Date crossing the server/client boundary is serialised to a UTC instant,
  // so a server-built local midnight would be re-read in the browser's zone and
  // land on the previous day for any browser behind the server's offset.
  const selected = parseDateParam(selectedDate);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    router.push(`/dashboard?date=${formatDateParam(date)}`);
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
            {format(selected, "do MMM yyyy")}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
