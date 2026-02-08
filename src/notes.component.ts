import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Note } from './supabase.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notes-container">
      <div class="notes-header">
        <h3>Notes pour le {{ formatDateFR(selectedDate) }}</h3>
        <button class="add-button" (click)="showForm()">+ Nouvelle note</button>
      </div>

      <div class="note-form" *ngIf="isFormVisible">
        <input
          type="text"
          [(ngModel)]="currentNote.title"
          placeholder="Titre de la note"
          class="form-input"
        />
        <textarea
          [(ngModel)]="currentNote.content"
          placeholder="Contenu de la note..."
          class="form-textarea"
          rows="4"
        ></textarea>
        <div class="form-buttons">
          <button class="save-button" (click)="saveNote()">
            {{ editingNoteId ? 'Modifier' : 'Sauvegarder' }}
          </button>
          <button class="cancel-button" (click)="cancelForm()">Annuler</button>
        </div>
      </div>

      <div class="notes-list">
        <div *ngIf="notes.length === 0 && !isFormVisible" class="empty-state">
          <p>Aucune note pour cette date</p>
          <p class="empty-hint">Cliquez sur "Nouvelle note" pour en créer une</p>
        </div>

        <div *ngFor="let note of notes" class="note-card">
          <div class="note-content">
            <h4>{{ note.title }}</h4>
            <p>{{ note.content }}</p>
            <span class="note-time">{{ formatTime(note.created_at) }}</span>
          </div>
          <div class="note-actions">
            <button class="edit-button" (click)="editNote(note)">Modifier</button>
            <button class="delete-button" (click)="deleteNote(note.id!)">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notes-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .notes-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .add-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }

    .add-button:hover {
      background: #1976d2;
    }

    .note-form {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #2196f3;
    }

    .form-textarea {
      resize: vertical;
    }

    .form-buttons {
      display: flex;
      gap: 12px;
    }

    .save-button,
    .cancel-button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .save-button {
      background: #4caf50;
      color: white;
    }

    .save-button:hover {
      background: #45a049;
    }

    .cancel-button {
      background: #e0e0e0;
      color: #333;
    }

    .cancel-button:hover {
      background: #d0d0d0;
    }

    .notes-list {
      flex: 1;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .empty-state p {
      margin: 8px 0;
    }

    .empty-hint {
      font-size: 14px;
    }

    .note-card {
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      transition: box-shadow 0.2s;
    }

    .note-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .note-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .note-content p {
      margin: 0 0 8px 0;
      color: #555;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .note-time {
      font-size: 12px;
      color: #999;
    }

    .note-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .edit-button,
    .delete-button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .edit-button {
      background: #e3f2fd;
      color: #2196f3;
    }

    .edit-button:hover {
      background: #bbdefb;
    }

    .delete-button {
      background: #ffebee;
      color: #f44336;
    }

    .delete-button:hover {
      background: #ffcdd2;
    }
  `]
})
export class NotesComponent implements OnChanges {
  @Input() selectedDate: string = '';
  @Output() notesChanged = new EventEmitter<void>();

  notes: Note[] = [];
  isFormVisible = false;
  editingNoteId: string | null = null;
  currentNote: Partial<Note> = {
    title: '',
    content: ''
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnChanges() {
    if (this.selectedDate) {
      await this.loadNotes();
      this.cancelForm();
    }
  }

  async loadNotes() {
    this.notes = await this.supabaseService.getNotesByDate(this.selectedDate);
  }

  showForm() {
    this.isFormVisible = true;
    this.editingNoteId = null;
    this.currentNote = {
      title: '',
      content: ''
    };
  }

  cancelForm() {
    this.isFormVisible = false;
    this.editingNoteId = null;
    this.currentNote = {
      title: '',
      content: ''
    };
  }

  async saveNote() {
    if (!this.currentNote.title || !this.currentNote.content) {
      alert('Veuillez remplir le titre et le contenu');
      return;
    }

    if (this.editingNoteId) {
      await this.supabaseService.updateNote(this.editingNoteId, this.currentNote);
    } else {
      await this.supabaseService.createNote({
        date: this.selectedDate,
        title: this.currentNote.title,
        content: this.currentNote.content
      });
    }

    await this.loadNotes();
    this.cancelForm();
    this.notesChanged.emit();
  }

  editNote(note: Note) {
    this.isFormVisible = true;
    this.editingNoteId = note.id!;
    this.currentNote = {
      title: note.title,
      content: note.content
    };
  }

  async deleteNote(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      await this.supabaseService.deleteNote(id);
      await this.loadNotes();
      this.notesChanged.emit();
    }
  }

  formatDateFR(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timestamp: string | undefined): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
