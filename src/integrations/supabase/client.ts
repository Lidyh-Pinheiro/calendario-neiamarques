// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://btkehyaxzttrzjcaofav.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2VoeWF4enR0cnpqY2FvZmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxOTIzNjcsImV4cCI6MjA1ODc2ODM2N30.41vUltVdXwgFobW9GKFKYYPIHApELyjSq600Wm75vDg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-client-info': 'socialcalendar-app',
      },
    },
  }
);

/**
 * Helper function to safely get items from localStorage
 * @param key The key to retrieve from localStorage
 * @returns The parsed JSON value or null if not found/invalid
 */
export const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Helper function to safely set items in localStorage
 * @param key The key to set in localStorage
 * @param value The value to store
 */
export const setInLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
};

/**
 * Fetch clients from Supabase
 */
export const fetchClients = async () => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    // Map database fields to the expected client format
    const formattedClients = data?.map(client => ({
      id: client.id,
      name: client.name,
      themeColor: client.themecolor,
      password: client.password || '',
      createdAt: client.created_at
    })) || [];
    
    return formattedClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

/**
 * Fetch posts for a specific client from Supabase
 */
export const fetchClientPosts = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('clientid', clientId)
      .order('date');
    
    if (error) throw error;
    
    // Return data directly without field name conversions
    // This ensures we match the CalendarPost interface expected by components
    return data || [];
  } catch (error) {
    console.error(`Error fetching posts for client ${clientId}:`, error);
    return [];
  }
};

/**
 * Add or update a post in Supabase
 */
export const savePost = async (post: any) => {
  try {
    // Map the post directly without field name conversions
    // This ensures we match the database column names
    const dbPost = {
      id: post.id,
      clientid: post.clientid,
      date: post.date,
      day: post.day,
      dayofweek: post.dayofweek,
      title: post.title,
      type: post.type,
      posttype: post.posttype,
      text: post.text,
      completed: post.completed || false,
      notes: post.notes || '',
      images: post.images || [],
      socialnetworks: post.socialnetworks || [],
      month: post.month,
      year: post.year,
      time: post.time
    };
    
    // If post has an id, update it, otherwise insert a new one
    const { data, error } = post.id ? 
      await supabase
        .from('posts')
        .update(dbPost)
        .eq('id', post.id)
        .select() :
      await supabase
        .from('posts')
        .insert(dbPost)
        .select();
    
    if (error) throw error;
    
    // Return the first item from data array if it exists
    if (data && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error saving post:', error);
    return null;
  }
};

/**
 * Delete a post from Supabase
 */
export const deletePost = async (postId: number) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    return false;
  }
};

/**
 * Fetch a client by ID with optional password verification
 */
export const fetchClientById = async (clientId: string, password?: string) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) throw error;
    
    // If password is provided, verify it matches
    if (password && data.password && data.password !== password) {
      return null;
    }
    
    // Map database fields to the expected client format
    return {
      id: data.id,
      name: data.name,
      themeColor: data.themecolor,
      password: data.password || '',
      createdAt: data.created_at
    };
  } catch (error) {
    console.error(`Error fetching client ${clientId}:`, error);
    return null;
  }
};

/**
 * Save client to Supabase
 */
export const saveClient = async (client: any) => {
  try {
    // Map the client to match database column names
    const dbClient = {
      id: client.id,
      name: client.name,
      themecolor: client.themeColor,
      password: client.password || ''
    };
    
    // If client has an id, update it, otherwise insert a new one
    const { data, error } = client.id ? 
      await supabase
        .from('clients')
        .update(dbClient)
        .eq('id', client.id)
        .select() :
      await supabase
        .from('clients')
        .insert(dbClient)
        .select();
    
    if (error) throw error;
    
    // Map database response back to the expected format
    if (data && data.length > 0) {
      return {
        id: data[0].id,
        name: data[0].name,
        themeColor: data[0].themecolor,
        password: data[0].password || '',
        createdAt: data[0].created_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error saving client:', error);
    return null;
  }
};
