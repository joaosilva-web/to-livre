import { UIAppointment } from "./appointments";

export interface WorkingHour {
  dayOfWeek: number;
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

export interface AvailableSlot {
  time: string; // "HH:mm"
  available: boolean;
}

/**
 * Generate available slots for a given date, working hours, service duration and existing appointments.
 * - selectedDate: Date object representing the day to generate slots for
 * - workingHours: list of WorkingHour (server shape)
 * - durationMinutes: service duration in minutes
 * - existingAppointments: UIAppointments with full ISO date strings
 */
export function generateSlots(
  selectedDate: Date,
  workingHours: WorkingHour[],
  durationMinutes: number,
  existingAppointments: UIAppointment[],
  serviceDurationMap?: Record<string, number>,
  debug: boolean = false
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const dayIndex = selectedDate.getDay();
  const todaysWorkingHours = workingHours.filter(
    (wh) => wh?.dayOfWeek === dayIndex
  );

  if (todaysWorkingHours.length === 0) return slots;

  todaysWorkingHours.forEach((wh) => {
    const [startHour, startMinute] = wh.openTime.split(":").map(Number);
    const [endHour, endMinute] = wh.closeTime.split(":").map(Number);

    const start = new Date(selectedDate);
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(endHour, endMinute, 0, 0);

    const current = new Date(start);

    while (current.getTime() + durationMinutes * 60_000 <= end.getTime()) {
      const timeStr = current.toTimeString().slice(0, 5);

      const isOccupied = existingAppointments.some((appt) => {
        // appt.date is expected to be full ISO string (UTC or with timezone)
        const apptStart = new Date(appt.date);
        // determine appointment duration: prefer map value, fall back to provided duration
        const apptDuration = Number(
          (appt.serviceId && serviceDurationMap?.[appt.serviceId]) ??
            durationMinutes
        );
        const apptEnd = new Date(apptStart);
        apptEnd.setMinutes(apptEnd.getMinutes() + apptDuration);

        const overlap = !(
          current.getTime() + durationMinutes * 60_000 <= apptStart.getTime() ||
          current.getTime() >= apptEnd.getTime()
        );

        if (debug) {
          // print a compact debug line for each potential overlap

          console.log(
            `[slotGeneration] slot=${timeStr} slotMs=${current.getTime()} appt=${
              appt.id
            } apptDate=${
              appt.date
            } apptStartMs=${apptStart.getTime()} apptEndMs=${apptEnd.getTime()} overlap=${overlap}`
          );
        }

        return overlap;
      });

      slots.push({ time: timeStr, available: !isOccupied });
      current.setMinutes(current.getMinutes() + durationMinutes);
    }
  });

  return slots;
}

export default generateSlots;
