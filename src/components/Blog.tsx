import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { Link, useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { Calendar, User, Tag, ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MpesaLogo } from './MpesaLogo';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorName: string;
  coverImage?: string;
  tags?: string[];
  createdAt: any;
  updatedAt: any;
  metaTitle?: string;
  metaDescription?: string;
}

export const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  useEffect(() => {
    const path = 'posts';
    const q = query(
      collection(db, path),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );

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

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00A651]" />
      </div>
    );
  }

  if (slug) {
    const post = posts.find(p => p.slug === slug);
    if (!post) {
      return (
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Link to="/blog" className="text-[#00A651] hover:underline">Back to Blog</Link>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 max-w-4xl"
      >
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#00A651] mb-8 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {post.coverImage && (
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-[400px] object-cover rounded-2xl mb-8 shadow-lg"
            referrerPolicy="no-referrer"
          />
        )}

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-10 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {post.authorName}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently'}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <div className="flex gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-[#00A651] prose-img:rounded-xl">
          <Markdown>{post.content}</Markdown>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">
          The <span className="text-[#00A651]">M-PESA</span> Blog
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Tips, tricks, and updates on how to grow your business with professional payment posters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.article 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <Link to={`/blog/${post.slug}`} className="block overflow-hidden h-48">
              {post.coverImage ? (
                <img 
                  src={post.coverImage} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center p-8">
                  <MpesaLogo className="h-16 w-auto opacity-50" />
                </div>
              )}
            </Link>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <Calendar className="h-3 w-3" />
                {post.createdAt?.toDate ? format(post.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 mb-3 group-hover:text-[#00A651] transition-colors">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>
              <Link 
                to={`/blog/${post.slug}`}
                className="text-sm font-bold text-[#00A651] flex items-center gap-1 hover:gap-2 transition-all"
              >
                Read More <ChevronLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">No posts published yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};
