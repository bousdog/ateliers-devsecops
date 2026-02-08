import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from './supabase.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasNotes: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar">
      <div class="calendar-header">
        <button (click)="previousMonth()" class="nav-button">&lt;</button>
        <h2>{{ monthName }} {{ currentYear }}</h2>
        <button (click)="nextMonth()" class="nav-button">&gt;</button>
      </div>

      <div class="calendar-grid">
        <div class="day-header" *ngFor="let day of weekDays">{{ day }}</div>

        <div
          *ngFor="let day of calendarDays"
          class="calendar-day"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.selected]="day.isSelected"
          [class.has-notes]="day.hasNotes"
          (click)="selectDate(day)">
          <span>{{ day.dayNumber }}</span>
          <span class="note-indicator" *ngIf="day.hasNotes">●</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .calendar-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .nav-button {
      background: #f0f0f0;
      border: none;
      border-radius: 8px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 18px;
      transition: background 0.2s;
    }

    .nav-button:hover {
      background: #e0e0e0;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .day-header {
      text-align: center;
      font-weight: 600;
      padding: 12px;
      color: #666;
      font-size: 14px;
    }

    .calendar-day {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      background: #fafafa;
      border: 2px solid transparent;
    }

    .calendar-day:hover {
      background: #f0f0f0;
    }

    .calendar-day.other-month {
      opacity: 0.3;
    }

    .calendar-day.today {
      background: #e3f2fd;
      font-weight: 600;
    }

    .calendar-day.selected {
      background: #2196f3;
      color: white;
      border-color: #1976d2;
    }

    .calendar-day.has-notes {
      background: #fff3e0;
    }

    .calendar-day.selected.has-notes {
      background: #2196f3;
    }

    .note-indicator {
      position: absolute;
      bottom: 4px;
      font-size: 8px;
      color: #ff9800;
    }

    .calendar-day.selected .note-indicator {
      color: white;
    }
  `]
})
export class CalendarComponent implements OnInit {
  @Output() dateSelected = new EventEmitter<string>();

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  calendarDays: CalendarDay[] = [];
  currentMonth: number;
  currentYear: number;
  selectedDate: Date;
  monthName: string = '';
  noteDates: Set<string> = new Set();

  constructor(private supabaseService: SupabaseService) {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.selectedDate = today;
  }

  async ngOnInit() {
    await this.loadNoteDates();
    this.generateCalendar();
    this.emitSelectedDate();
  }

  async loadNoteDates() {
    const dates = await this.supabaseService.getAllNoteDates();
    this.noteDates = new Set(dates);
  }

  generateCalendar() {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    this.monthName = monthNames[this.currentMonth];

    let startDay = firstDay.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay.getDate() - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const dateStr = this.formatDate(date);

    return {
      date: date,
      dayNumber: date.getDate(),
      isCurrentMonth: isCurrentMonth,
      isToday: dateStr === this.formatDate(today),
      isSelected: dateStr === this.formatDate(this.selectedDate),
      hasNotes: this.noteDates.has(dateStr)
    };
  }

  selectDate(day: CalendarDay) {
    this.selectedDate = day.date;
    this.generateCalendar();
    this.emitSelectedDate();
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  emitSelectedDate() {
    this.dateSelected.emit(this.formatDate(this.selectedDate));
  }

  async refresh() {
    await this.loadNoteDates();
    this.generateCalendar();
  }
}
