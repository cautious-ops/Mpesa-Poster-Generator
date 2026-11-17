import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, Loader2, Image as ImageIcon, Layout, Type, FileText, Search, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName: string;
  coverImage?: string;
  tags?: string[];
  status: 'draft' | 'published';
  createdAt: any;
  updatedAt: any;
  metaTitle?: string;
  metaDescription?: string;
}

export const AdminBlog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');

  useEffect(() => {
    const path = 'posts';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreate = () => {
    setEditingPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      tags: [],
      coverImage: '',
      metaTitle: '',
      metaDescription: ''
    });
    setActiveTab('content');
  };

  const handleEdit = (post: Post) => {
    setEditingPost({ ...post });
    setActiveTab('content');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const path = `posts/${id}`;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.slug || !editingPost?.content) {
      alert('Please fill in all required fields (Title, Slug, Content)');
      return;
    }

    setIsSaving(true);
    const path = editingPost.id ? `posts/${editingPost.id}` : 'posts';
    
    try {
      const postData = {
        ...editingPost,
        updatedAt: serverTimestamp(),
        authorId: auth.currentUser?.uid,
        authorName: auth.currentUser?.displayName || 'Admin',
      };

      if (editingPost.id) {
        const { id, ...data } = postData;
        await updateDoc(doc(db, 'posts', id), data);
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: serverTimestamp()
        });
      }
      setEditingPost(null);
    } catch (error) {
      handleFirestoreError(error, editingPost.id ? OperationType.UPDATE : OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A651]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Blog Management</h1>
          <p className="text-slate-500">Create and manage SEO-rich blog posts.</p>
        </div>
        {!editingPost && (
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 bg-[#00A651] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#008a44] transition-all shadow-lg shadow-[#00A651]/20"
          >
            <Plus className="h-5 w-5" />
            New Post
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editingPost ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="border-b border-slate-100 p-6 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-white text-[#00A651] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Content
                </button>
                <button 
                  onClick={() => setActiveTab('seo')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'seo' ? 'bg-white text-[#00A651] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  SEO & Meta
                </button>
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'preview' ? 'bg-white text-[#00A651] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Preview
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEditingPost(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#00A651] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#008a44] transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Post
                </button>
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'content' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-widest text-slate-400">Title *</label>
                      <input 
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value, slug: generateSlug(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all font-bold text-lg"
                        placeholder="Enter post title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-widest text-slate-400">Slug *</label>
                      <input 
                        type="text"
                        value={editingPost.slug}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all font-mono text-sm"
                        placeholder="url-friendly-slug"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Cover Image URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input 
                        type="text"
                        value={editingPost.coverImage}
                        onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Excerpt</label>
                    <textarea 
                      value={editingPost.excerpt}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all h-24 resize-none"
                      placeholder="Short summary of the post..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Content (Markdown) *</label>
                    <textarea 
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all h-[400px] font-mono text-sm"
                      placeholder="# Your content here..."
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-bold text-slate-700">Status:</label>
                      <select 
                        value={editingPost.status}
                        onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                        className="bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-sm outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Meta Title</label>
                    <input 
                      type="text"
                      value={editingPost.metaTitle}
                      onChange={(e) => setEditingPost({ ...editingPost, metaTitle: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all"
                      placeholder="SEO Title (defaults to post title)"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Meta Description</label>
                    <textarea 
                      value={editingPost.metaDescription}
                      onChange={(e) => setEditingPost({ ...editingPost, metaDescription: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00A651] focus:border-transparent outline-none transition-all h-32 resize-none"
                      placeholder="SEO Meta Description (defaults to excerpt)"
                    />
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Google Search Preview</h4>
                    <div className="space-y-1">
                      <div className="text-[#1a0dab] text-xl hover:underline cursor-pointer truncate">
                        {editingPost.metaTitle || editingPost.title || 'Post Title'}
                      </div>
                      <div className="text-[#006621] text-sm truncate">
                        https://m-pesaposter.com/blog/{editingPost.slug || 'slug'}
                      </div>
                      <div className="text-[#4d5156] text-sm line-clamp-2">
                        {editingPost.metaDescription || editingPost.excerpt || 'Meta description will appear here...'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="max-w-4xl mx-auto">
                  <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-[#00A651] prose-img:rounded-xl">
                    <h1>{editingPost.title || 'Untitled Post'}</h1>
                    <Markdown>{editingPost.content || '*No content yet*'}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4"
          >
            {posts.map(post => (
              <div 
                key={post.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#00A651]/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        /{post.slug}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(post)}
                    className="p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            {posts.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No posts found. Start by creating your first post!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
