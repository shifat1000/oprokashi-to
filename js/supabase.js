import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase Credentials
const SUPABASE_URL = 'https://ilyhduamceswcdgtdhyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlseWhkdWFtY2Vzd2NkZ3RkaHloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjE4NzMsImV4cCI6MjEwMTQ5Nzg3M30.fSBTDqGRJ1dfImETfOTJzM38y_NLTv8JCUVwHC7bFV8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch all stories
export async function fetchStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
  return data;
}

// Fetch single story
export async function fetchStoryById(id) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
  return data;
}

// Create new story
export async function createStory(storyData) {
  const { data, error } = await supabase
    .from('stories')
    .insert([storyData])
    .select();

  if (error) {
    console.error('Error creating story:', error);
    throw error;
  }
  return data;
}

// Update story
export async function updateStory(id, storyData) {
  const { data, error } = await supabase
    .from('stories')
    .update(storyData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating story:', error);
    throw error;
  }
  return data;
}

// Delete story
export async function deleteStory(id) {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
  return true;
}

// Upload cover image to storage
export async function uploadCoverImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('covers')
    .getPublicUrl(filePath);

  return data.publicUrl;
}