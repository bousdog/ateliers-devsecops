import { Component, ViewChild } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CalendarComponent } from './calendar.component';
import { NotesComponent } from './notes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalendarComponent, NotesComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>📅 Mon Calendrier de Notes (Atelier2)</h1>
        <p>Organisez vos idées et vos tâches quotidiennes</p>
      </header>

      <div class="main-content">
        <div class="calendar-section">
          <app-calendar
            (dateSelected)="onDateSelected($event)"
          ></app-calendar>
        </div>

        <div class="notes-section">
          <app-notes
            [selectedDate]="selectedDate"
            (notesChanged)="onNotesChanged()"
          ></app-notes>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .app-header {
      text-align: center;
      margin-bottom: 40px;
      color: white;
    }

    .app-header h1 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 700;
    }

    .app-header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 968px) {
      .main-content {
        grid-template-columns: 1fr;
      }
    }

    .calendar-section,
    .notes-section {
      min-height: 500px;
    }
  `]
})
export class App {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  selectedDate: string = '';

  onDateSelected(date: string) {
    this.selectedDate = date;
  }

  onNotesChanged() {
    if (this.calendarComponent) {
      this.calendarComponent.refresh();
    }
  }
}

bootstrapApplication(App);
