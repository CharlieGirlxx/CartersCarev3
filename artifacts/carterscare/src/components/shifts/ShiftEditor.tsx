import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, X, Save, Calendar, Clock, Users } from "lucide-react";
import { serviceTypeOptions } from "@/lib/constants";

interface ShiftEditorProps {
  participantId: number;
  participantName: string;
  onClose: () => void;
  onSave?: (shift: any) => void;
  initialShift?: any;
}

export function ShiftEditor({ participantId, participantName, onClose, onSave, initialShift }: ShiftEditorProps) {
  const [shiftDate, setShiftDate] = useState(initialShift?.startTime?.split('T')[0] || '');
  const [startTime, setStartTime] = useState(initialShift?.startTime?.split('T')[1]?.slice(0, 5) || '09:00');
  const [endTime, setEndTime] = useState(initialShift?.endTime?.split('T')[1]?.slice(0, 5) || '17:00');
  const [serviceType, setServiceType] = useState(initialShift?.serviceType || 'daily_activities');
  const [staffId, setStaffId] = useState(initialShift?.staffId || '');
  const [location, setLocation] = useState(initialShift?.location || '');
  const [requiresTwoWorkers, setRequiresTwoWorkers] = useState(initialShift?.requiresTwoWorkers || false);
  const [notes, setNotes] = useState(initialShift?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shiftDate) newErrors.shiftDate = 'Date is required';
    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';
    if (!staffId) newErrors.staffId = 'Staff member is required';

    // Check if start time is before end time
    if (startTime && endTime && startTime >= endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const shiftData = {
      startTime: `${shiftDate}T${startTime}:00`,
      endTime: `${shiftDate}T${endTime}:00`,
      serviceType,
      staffId: parseInt(staffId),
      location,
      requiresTwoWorkers,
      notes,
    };

    onSave?.(shiftData);
  };

  return (
    <Card className="w-full max-w-md border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {initialShift ? 'Edit Shift' : 'Add Shift'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client Info - Read Only */}
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="text-slate-600 font-medium">{participantName}</p>
          <p className="text-slate-500 text-xs">Client ID: {participantId}</p>
        </div>

        {/* Shift Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            className={errors.shiftDate ? 'border-rose-500' : ''}
          />
          {errors.shiftDate && <p className="text-xs text-rose-600">{errors.shiftDate}</p>}
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Start Time
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={errors.startTime ? 'border-rose-500' : ''}
            />
            {errors.startTime && <p className="text-xs text-rose-600">{errors.startTime}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm font-medium">
              End Time
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={errors.endTime ? 'border-rose-500' : ''}
            />
            {errors.endTime && <p className="text-xs text-rose-600">{errors.endTime}</p>}
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label htmlFor="serviceType" className="text-sm font-medium">
            Service Type
          </Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {serviceTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff Member */}
        <div className="space-y-2">
          <Label htmlFor="staff" className="text-sm font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            Assigned Staff
          </Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger className={errors.staffId ? 'border-rose-500' : ''}>
              <SelectValue placeholder="Select staff member..." />
            </SelectTrigger>
            <SelectContent>
              {/* TODO: Fetch from API */}
              <SelectItem value="1">John Smith</SelectItem>
              <SelectItem value="2">Jane Doe</SelectItem>
              <SelectItem value="3">Mike Johnson</SelectItem>
            </SelectContent>
          </Select>
          {errors.staffId && <p className="text-xs text-rose-600">{errors.staffId}</p>}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location
          </Label>
          <Input
            id="location"
            placeholder="e.g., Client's home, Community center"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes
          </Label>
          <textarea
            id="notes"
            placeholder="Any special instructions or notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-20 rounded-lg border border-slate-200 p-2 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Two Workers Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="twoWorkers"
            type="checkbox"
            checked={requiresTwoWorkers}
            onChange={(e) => setRequiresTwoWorkers(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-violet-600"
          />
          <Label htmlFor="twoWorkers" className="text-sm font-medium cursor-pointer">
            Requires 2 Support Workers
          </Label>
        </div>

        {/* Info Alert */}
        <div className="rounded-lg bg-blue-50 p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            This shift will be recorded in the audit log. Changes are tracked for compliance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-violet-600 hover:bg-violet-700">
            <Save className="w-4 h-4 mr-2" />
            Save Shift
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
