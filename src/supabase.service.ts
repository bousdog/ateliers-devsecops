import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Note {
  id?: string;
  date: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    const supabaseUrl =  import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseKey =  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    this.supabase = createClient(
      supabaseUrl,
      supabaseKey
    );
  }

  async getNotesByDate(date: string): Promise<Note[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return [];
    }

    return data || [];
  }

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from('notes')
      .insert([note])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  }

  async updateNote(id: string, note: Partial<Note>): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from('notes')
      .update({ ...note, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating note:', error);
      return null;
    }

    return data;
  }

  async deleteNote(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    return true;
  }

  async getAllNoteDates(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('notes')
      .select('date');

    if (error) {
      console.error('Error fetching note dates:', error);
      return [];
    }

    const uniqueDates = [...new Set(data.map(item => item.date))];
    return uniqueDates;
  }
}
