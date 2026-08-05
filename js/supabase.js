/* ==========================================================================
   অপ্রকাশিত V2 — Supabase Helper & API Layer
   ========================================================================== */

// ১. Supabase Client Setup
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================================
   AUTHENTICATION HELPERS
   ========================================================================== */

// Admin Login Check
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Auth User Error:', error.message);
    return null;
  }
  return user;
}

// Admin Login Function
export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Admin Logout Function
export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = 'login.html';
}

/* ==========================================================================
   STORIES DATABASE CRUD & QUERIES
   ========================================================================== */

// ১. সব প্রকাশিত গল্প আনা (Search & Category Filter সহ)
export async function fetchStories({ search = '', category = '', limit = 50, featuredOnly = false } = {}) {
  let query = supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (featuredOnly) {
    query = query.eq('featured', true);
  }

  if (category && category !== 'সব') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,author.ilike.%${search}%`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching stories:', error.message);
    return [];
  }
  return data;
}

// ২. ট্রেন্ডিং/পছন্দসই গল্প আনা (সর্বশেষ অনুযায়ী)
export async function fetchTrendingStories(limit = 5) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching trending stories:', error.message);
    return [];
  }
  return data;
}

// ৩. একটি নির্দিষ্ট গল্প আইডি দিয়ে ফেচ করা
export async function fetchStoryById(id) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching story:', error.message);
    return null;
  }
  return data;
}

// ৪. সম্পর্কিত গল্প আনা (Category অনুযায়ী)
export async function fetchRelatedStories(category, currentId, limit = 3) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('category', category)
    .neq('id', currentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related stories:', error.message);
    return [];
  }
  return data;
}

// ৫. নতুন গল্প Publish করা (Admin)
export async function createStory(storyData) {
  const { data, error } = await supabase
    .from('stories')
    .insert([storyData])
    .select();

  if (error) throw error;
  return data;
}

// ৬. গল্প Edit/Update করা (Admin)
export async function updateStory(id, storyData) {
  const { data, error } = await supabase
    .from('stories')
    .update(storyData)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
}

// ৭. গল্প Delete করা (Admin)
export async function deleteStory(id) {
  const { data, error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
}

/* ==========================================================================
   SUPABASE STORAGE (IMAGE UPLOAD)
   ========================================================================== */

// Supabase Storage Bucket এ ছবি আপলোড করা
export async function uploadCoverImage(file) {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  const { data, error } = await supabase.storage
    .from('story-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Image upload error:', error.message);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('story-covers')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}