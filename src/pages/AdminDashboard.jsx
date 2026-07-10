import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';
import { useTheme, ThemePickerModal, ThemeToggleButton } from '../components/ThemeManager';
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showThemePicker, applyTheme, toggleTheme } = useTheme();
  const [activePanel, setActivePanel] = useState('overview');
  const [videoFilter, setVideoFilter] = useState('all');
  const [isExiting, setIsExiting] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [isUploadingVideoThumb, setIsUploadingVideoThumb] = useState(false);
  const [isUploadingPostImg, setIsUploadingPostImg] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  // Smooth exit transition handler
  const handleExit = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate('/');
    }, 500); // matches CSS animation duration
  }, [isExiting, navigate]);

  const [stats, setStats] = useState({
    totalVideos: 0,
    totalPosts: 0,
    totalSubscribers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    videosByCategory: { history: 0, men: 0, women: 0 }
  });
  
  const [videos, setVideos] = useState([]);
  const [posts, setPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);

  // Toast notifications state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Custom Dropdowns open/close state
  const [isVideoCategoryOpen, setIsVideoCategoryOpen] = useState(false);
  const [isPostCategoryOpen, setIsPostCategoryOpen] = useState(false);

  // Form Fields - Video
  const [videoTitle, setVideoTitle] = useState('');
  const [videoCategory, setVideoCategory] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [videoFeatured, setVideoFeatured] = useState(false);

  // Form Fields - Post
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postContent, setPostContent] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Load all dashboard data
  const loadAllData = async () => {
    try {
      const [statsRes, videosRes, postsRes, subsRes, msgsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/videos'),
        fetch('/api/posts'),
        fetch('/api/subscribers'),
        fetch('/api/messages')
      ]);

      const statsData = await statsRes.json();
      const videosData = await videosRes.json();
      const postsData = await postsRes.json();
      const subsData = await subsRes.json();
      const msgsData = await msgsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (videosData.success) setVideos(videosData.data);
      if (postsData.success) setPosts(postsData.data);
      if (subsData.success) setSubscribers(subsData.data);
      if (msgsData.success) setMessages(msgsData.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Error loading dashboard data', 'error');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('Video deleted successfully', 'success');
        loadAllData();
      } else {
        showToast(result.message || 'Failed to delete video', 'error');
      }
    } catch (err) {
      showToast('Error deleting video', 'error');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('Post deleted successfully', 'success');
        loadAllData();
      } else {
        showToast(result.message || 'Failed to delete post', 'error');
      }
    } catch (err) {
      showToast('Error deleting post', 'error');
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
      const result = await res.json();
      if (result.success) {
        showToast('Message marked as read', 'success');
        loadAllData();
      } else {
        showToast(result.message || 'Failed to mark as read', 'error');
      }
    } catch (err) {
      showToast('Error reading message', 'error');
    }
  };

  const handleImageUpload = async (e, setUrl, setUploadingState) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingState(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setUrl(data.url);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingState(false);
    }
  };

  const handleEditVideo = (video) => {
    setVideoTitle(video.title || '');
    setVideoCategory(video.category || '');
    setVideoDescription(video.description || '');
    setVideoUrl(video.videoUrl || '');
    setVideoDuration(video.duration || '');
    setVideoThumbnail(video.thumbnail || '');
    setVideoTags((video.tags || []).join(', '));
    setVideoFeatured(video.featured || false);
    setEditingVideoId(video.id);
    setIsAddingVideo(true);
  };

  const handleEditPost = (post) => {
    setPostTitle(post.title || '');
    setPostCategory(post.category || '');
    setPostImageUrl(post.imageUrl || '');
    setPostContent(post.content || '');
    setEditingPostId(post.id);
    setIsAddingPost(true);
  };

  const handleAddVideoSubmit = async (e) => {
    e.preventDefault();
    if (!videoTitle || !videoCategory || !videoDescription) {
      showToast('Title, Category, and Description are required', 'error');
      return;
    }

    const tags = videoTags ? videoTags.split(',').map(t => t.trim()).filter(Boolean) : [];

    try {
      const url = editingVideoId ? `/api/videos/${editingVideoId}` : '/api/videos';
      const method = editingVideoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle,
          category: videoCategory,
          description: videoDescription,
          videoUrl,
          duration: videoDuration,
          thumbnail: videoThumbnail,
          tags,
          featured: videoFeatured
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast(` Video ${editingVideoId ? 'updated' : 'added'} successfully!`, 'success');
        // Reset fields
        setVideoTitle('');
        setVideoCategory('');
        setVideoDescription('');
        setVideoUrl('');
        setVideoDuration('');
        setVideoThumbnail('');
        setVideoTags('');
        setVideoFeatured(false);
        setEditingVideoId(null);
        // Refresh & switch panel
        await loadAllData();
        setIsAddingVideo(false);
      } else {
        showToast(data.message || 'Failed to add video', 'error');
      }
    } catch (err) {
      showToast('Error adding video', 'error');
    }
  };

  const handleAddPostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle || !postImageUrl) {
      showToast('Title and Image URL are required', 'error');
      return;
    }

    try {
      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts';
      const method = editingPostId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle,
          category: postCategory || 'Photo',
          imageUrl: postImageUrl,
          content: postContent
        })
      });
      const data = await res.json();

      if (data.success) {
        showToast(` Post ${editingPostId ? 'updated' : 'added'} successfully!`, 'success');
        // Reset fields
        setPostTitle('');
        setPostCategory('');
        setPostImageUrl('');
        setPostContent('');
        setEditingPostId(null);
        // Refresh & switch panel
        await loadAllData();
        setIsAddingPost(false);
      } else {
        showToast(data.message || 'Failed to add post', 'error');
      }
    } catch (err) {
      showToast('Error adding post', 'error');
    }
  };

  // Helper values
  const categoryLabels = {
    history: 'Fashion History',
    men: "Men's Fashion",
    women: "Women's Fashion"
  };

  const filteredVideos = videoFilter === 'all'
    ? videos
    : videos.filter(v => v.category === videoFilter);

  if (!isAuthenticated) {
    return (
      <div className={`admin-body ${isExiting ? 'admin-exiting' : 'admin-entering'}`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <div style={{ background: 'var(--color-bg-card)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div className="admin-nav-icon" style={{ fontSize: '2rem', marginBottom: '1rem', width: '60px', height: '60px', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-gold-dark)', color: 'var(--color-gold-light)' }}>L</div>
            <h2 style={{ color: 'var(--color-text-primary)', marginBottom: '1.5rem' }}>Admin Access</h2>
            <form onSubmit={handleLogin} className="admin-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="password" 
                placeholder="Enter admin password" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
                autoFocus
              />
              {loginError && <div style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>{loginError}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
            </form>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>Hint: The password is <strong>admin</strong></p>
            <button className="admin-exit-btn" onClick={handleExit} style={{ marginTop: '2rem', width: '100%', justifyContent: 'center' }}>
              <span className="admin-exit-btn-arrow" style={{ transform: 'rotate(180deg)', marginRight: '8px', marginLeft: 0 }}>→</span>
              <span className="admin-exit-btn-text">Back to Site</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-body ${isExiting ? 'admin-exiting' : 'admin-entering'}`}>
      {showThemePicker && <ThemePickerModal applyTheme={applyTheme} />}
      {/* Admin Navigation */}
      <nav className="admin-nav">
        <a href="/" className="admin-nav-brand" onClick={(e) => { e.preventDefault(); handleExit(); }}>
          <span className="admin-nav-icon">L</span>
          <span>The Loomist <small>Admin</small></span>
        </a>
        <div className="admin-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThemeToggleButton toggleTheme={toggleTheme} />
          <button className="admin-exit-btn" onClick={handleExit}>
            <span className="admin-exit-btn-text">Back to Site</span>
            <span className="admin-exit-btn-arrow">→</span>
          </button>
        </div>
      </nav>

      <div className="admin-layout" onClick={() => { setIsVideoCategoryOpen(false); setIsPostCategoryOpen(false); }}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <h4 className="admin-sidebar-title">Dashboard</h4>
            <button 
              className={`admin-sidebar-link ${activePanel === 'overview' ? 'active' : ''}`} 
              onClick={() => setActivePanel('overview')}
            >
              <span></span> Overview
            </button>
          </div>
          <div className="admin-sidebar-section">
            <h4 className="admin-sidebar-title">Content</h4>
            <button 
              className={`admin-sidebar-link ${activePanel === 'videos' ? 'active' : ''}`} 
              onClick={() => { setActivePanel('videos'); setVideoFilter('all'); setIsAddingVideo(false); }}
            >
              <span></span> Videos
            </button>
            <button 
              className={`admin-sidebar-link ${activePanel === 'posts' ? 'active' : ''}`} 
              onClick={() => { setActivePanel('posts'); setIsAddingPost(false); }}
            >
              <span></span> Photos & Posts
            </button>
          </div>
          <div className="admin-sidebar-section">
            <h4 className="admin-sidebar-title">Engagement</h4>
            <button 
              className={`admin-sidebar-link ${activePanel === 'subscribers' ? 'active' : ''}`} 
              onClick={() => setActivePanel('subscribers')}
            >
              <span></span> Subscribers
            </button>
            <button 
              className={`admin-sidebar-link ${activePanel === 'messages' ? 'active' : ''}`} 
              onClick={() => setActivePanel('messages')}
            >
              <span></span> Messages
            </button>
          </div>
          <div className="admin-sidebar-section admin-sidebar-exit-section">
            <div className="admin-sidebar-divider"></div>
            <button className="admin-sidebar-link admin-sidebar-exit-link" onClick={handleExit}>
              <span></span> Exit Admin
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Overview Panel */}
          {activePanel === 'overview' && (
            <div className="admin-panel active" id="panelOverview">
              <div className="admin-panel-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, Varun! Here's your content summary.</p>
              </div>

              <div className="admin-stats-grid">
                <div className="admin-stat-card" onClick={() => setActivePanel('videos')}>
                  <div className="admin-stat-icon"></div>
                  <div className="admin-stat-value">{stats.totalVideos}</div>
                  <div className="admin-stat-label">Videos</div>
                </div>
                <div className="admin-stat-card" onClick={() => setActivePanel('posts')}>
                  <div className="admin-stat-icon"></div>
                  <div className="admin-stat-value">{stats.totalPosts}</div>
                  <div className="admin-stat-label">Posts</div>
                </div>
                <div className="admin-stat-card" onClick={() => setActivePanel('subscribers')}>
                  <div className="admin-stat-icon"></div>
                  <div className="admin-stat-value">{stats.totalSubscribers}</div>
                  <div className="admin-stat-label">Subscribers</div>
                </div>
                <div className="admin-stat-card" onClick={() => setActivePanel('messages')}>
                  <div className="admin-stat-icon"></div>
                  <div className="admin-stat-value">{stats.totalMessages}</div>
                  <div className="admin-stat-label">Messages</div>
                </div>
                <div className="admin-stat-card" onClick={() => setActivePanel('messages')}>
                  <div className="admin-stat-icon"></div>
                  <div className="admin-stat-value">{stats.unreadMessages}</div>
                  <div className="admin-stat-label">Unread</div>
                </div>
              </div>

              <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '1.5rem' }}>
                <div className="admin-stat-card small" onClick={() => { setActivePanel('videos'); setVideoFilter('history'); }} title="Click to view History videos">
                  <div className="admin-stat-label">History Videos</div>
                  <div className="admin-stat-value">{stats.videosByCategory.history || 0}</div>
                </div>
                <div className="admin-stat-card small" onClick={() => { setActivePanel('videos'); setVideoFilter('men'); }} title="Click to view Men's Fashion videos">
                  <div className="admin-stat-label">Men's Fashion</div>
                  <div className="admin-stat-value">{stats.videosByCategory.men || 0}</div>
                </div>
                <div className="admin-stat-card small" onClick={() => { setActivePanel('videos'); setVideoFilter('women'); }} title="Click to view Women's Fashion videos">
                  <div className="admin-stat-label">Women's Fashion</div>
                  <div className="admin-stat-value">{stats.videosByCategory.women || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Videos Panel */}
          {activePanel === 'videos' && (
            <div className="admin-panel active" id="panelVideos">
              <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1>{isAddingVideo ? (editingVideoId ? 'Edit Video' : 'Add New Video') : 'Video Content'}</h1>
                  <p>{isAddingVideo ? (editingVideoId ? 'Update your video entry.' : 'Create a new video entry for The Loomist.') : 'Manage your fashion videos and content.'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  if (isAddingVideo) {
                    setIsAddingVideo(false);
                  } else {
                    setEditingVideoId(null);
                    setVideoTitle('');
                    setVideoCategory('');
                    setVideoDescription('');
                    setVideoUrl('');
                    setVideoDuration('');
                    setVideoThumbnail('');
                    setVideoTags('');
                    setVideoFeatured(false);
                    setIsAddingVideo(true);
                  }
                }}>
                  {isAddingVideo ? 'Cancel' : '+ Add New Video'}
                </button>
              </div>

              {!isAddingVideo ? (
                <>
                  <div className="admin-category-tabs">
                <button className={`admin-category-tab ${videoFilter === 'all' ? 'active' : ''}`} onClick={() => setVideoFilter('all')}>All Videos</button>
                <button className={`admin-category-tab ${videoFilter === 'history' ? 'active' : ''}`} onClick={() => setVideoFilter('history')}>Fashion History</button>
                <button className={`admin-category-tab ${videoFilter === 'men' ? 'active' : ''}`} onClick={() => setVideoFilter('men')}>Men's Fashion</button>
                <button className={`admin-category-tab ${videoFilter === 'women' ? 'active' : ''}`} onClick={() => setVideoFilter('women')}>Women's Fashion</button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Duration</th>
                      <th>Date</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.length > 0 ? (
                      filteredVideos.map(video => (
                        <tr key={video.id}>
                          <td><strong style={{ color: 'var(--color-text-primary)' }}>{video.title}</strong></td>
                          <td>
                            <span className={`badge badge-${video.category}`}>
                              {video.category === 'history' ? 'History' : video.category === 'men' ? 'Men' : 'Women'}
                            </span>
                          </td>
                          <td>{video.duration}</td>
                          <td>{new Date(video.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          <td>{video.featured ? <span className="badge badge-featured">Yes</span> : '—'}</td>
                          <td>
                            <button className="action-btn action-btn-edit" onClick={() => handleEditVideo(video)} style={{ marginRight: '8px' }}>Edit</button>
                            <button className="action-btn action-btn-delete" onClick={() => handleDeleteVideo(video.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="admin-empty">
                          <div className="admin-empty-icon"></div>
                          <div className="admin-empty-text">
                            No videos in "{videoFilter === 'all' ? 'All' : categoryLabels[videoFilter]}"
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
                </>
              ) : (
                <form className="admin-form" onSubmit={handleAddVideoSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoTitle">Title *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      id="videoTitle" 
                      placeholder="e.g., The Rise of Streetwear" 
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <div 
                      className={`custom-dropdown ${isVideoCategoryOpen ? 'open' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setIsVideoCategoryOpen(!isVideoCategoryOpen); }}
                    >
                      <div className={`custom-dropdown-trigger ${videoCategory ? 'selected' : ''}`}>
                        <span>{videoCategory ? categoryLabels[videoCategory] : 'Select category'}</span>
                        <div className="custom-dropdown-arrow"></div>
                      </div>
                      <div className="custom-dropdown-options">
                        <div 
                          className={`custom-dropdown-option ${videoCategory === 'history' ? 'active' : ''}`}
                          onClick={() => setVideoCategory('history')}
                        >
                          Fashion History
                        </div>
                        <div 
                          className={`custom-dropdown-option ${videoCategory === 'men' ? 'active' : ''}`}
                          onClick={() => setVideoCategory('men')}
                        >
                          Men's Fashion
                        </div>
                        <div 
                          className={`custom-dropdown-option ${videoCategory === 'women' ? 'active' : ''}`}
                          onClick={() => setVideoCategory('women')}
                        >
                          Women's Fashion
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="videoDescription">Description *</label>
                  <textarea 
                    className="form-textarea" 
                    id="videoDescription" 
                    placeholder="Describe the video content..." 
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoUrl">Video URL</label>
                    <input 
                      type="url" 
                      className="form-input" 
                      id="videoUrl" 
                      placeholder="Instagram reel or YouTube URL" 
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoDuration">Duration</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      id="videoDuration" 
                      placeholder="e.g., 8:30" 
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoThumbnail">Thumbnail Image</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        id="videoThumbnail" 
                        placeholder="/images/thumbnails/example.jpg" 
                        value={videoThumbnail}
                        onChange={(e) => setVideoThumbnail(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <label className="btn" style={{ padding: '0 15px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', height: '42px', marginTop: 0 }}>
                        {isUploadingVideoThumb ? ' Uploading...' : ' Upload'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => handleImageUpload(e, setVideoThumbnail, setIsUploadingVideoThumb)}
                          disabled={isUploadingVideoThumb}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="videoTags">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      id="videoTags" 
                      placeholder="men, history, suit" 
                      value={videoTags}
                      onChange={(e) => setVideoTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="videoFeatured" 
                    style={{ width: 'auto' }} 
                    checked={videoFeatured}
                    onChange={(e) => setVideoFeatured(e.target.checked)}
                  />
                  <label htmlFor="videoFeatured" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                    Mark as Featured
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  {editingVideoId ? 'Update Video' : 'Add Video'}
                  <span className="btn-icon">→</span>
                </button>
              </form>
              )}
            </div>
          )}

          {/* Posts Panel */}
          {activePanel === 'posts' && (
            <div className="admin-panel active" id="panelPosts">
              <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1>{isAddingPost ? (editingPostId ? 'Edit Post' : 'Add New Post or Photo') : 'Manage Posts & Photos'}</h1>
                  <p>{isAddingPost ? (editingPostId ? 'Update your post content.' : 'Create a new photo or text post for your audience.') : 'View, edit, or delete your image posts and text updates.'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                  if (isAddingPost) {
                    setIsAddingPost(false);
                  } else {
                    setEditingPostId(null);
                    setPostTitle('');
                    setPostCategory('');
                    setPostImageUrl('');
                    setPostContent('');
                    setIsAddingPost(true);
                  }
                }}>
                  {isAddingPost ? 'Cancel' : '+ Add New Post'}
                </button>
              </div>

              {!isAddingPost ? (
                <>
                  <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length > 0 ? (
                      posts.map(post => (
                        <tr key={post.id}>
                          <td><strong>{post.title}</strong></td>
                          <td><span className="badge badge-category">{post.category}</span></td>
                          <td>{new Date(post.date).toLocaleDateString()}</td>
                          <td>
                            <button className="action-btn action-btn-edit" onClick={() => handleEditPost(post)} style={{ marginRight: '8px' }}>Edit</button>
                            <button className="action-btn action-btn-delete" onClick={() => handleDeletePost(post.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-muted)', padding: '3rem 0' }}>
                          No posts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
                </>
              ) : (
              <form className="admin-form" onSubmit={handleAddPostSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="postTitle">Title *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      id="postTitle" 
                      placeholder="e.g., Summer Collection Sneak Peek" 
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <div 
                      className={`custom-dropdown ${isPostCategoryOpen ? 'open' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setIsPostCategoryOpen(!isPostCategoryOpen); }}
                    >
                      <div className={`custom-dropdown-trigger ${postCategory ? 'selected' : ''}`}>
                        <span>{postCategory ? postCategory : 'Select category'}</span>
                        <div className="custom-dropdown-arrow"></div>
                      </div>
                      <div className="custom-dropdown-options">
                        <div 
                          className={`custom-dropdown-option ${postCategory === 'Photo' ? 'active' : ''}`}
                          onClick={() => setPostCategory('Photo')}
                        >
                          Photo
                        </div>
                        <div 
                          className={`custom-dropdown-option ${postCategory === 'Text Post' ? 'active' : ''}`}
                          onClick={() => setPostCategory('Text Post')}
                        >
                          Text Post
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="postImageUrl">Image or Instagram URL *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      id="postImageUrl" 
                      placeholder="e.g., https://example.com/image.jpg OR Instagram link" 
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                      required 
                      style={{ flex: 1 }}
                    />
                    <label className="btn" style={{ padding: '0 15px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', background: 'var(--color-bg-card)', color: 'var(--color-text-primary)', height: '42px', marginTop: 0 }}>
                      {isUploadingPostImg ? ' Uploading...' : ' Upload'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleImageUpload(e, setPostImageUrl, setIsUploadingPostImg)}
                        disabled={isUploadingPostImg}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="postContent">Content / Caption</label>
                  <textarea 
                    className="form-textarea" 
                    id="postContent" 
                    placeholder="Write your post caption or content here..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  {editingPostId ? 'Update Post' : 'Add Post'}
                  <span className="btn-icon">→</span>
                </button>
              </form>
              )}
            </div>
          )}

          {/* Subscribers Panel */}
          {activePanel === 'subscribers' && (
            <div className="admin-panel active" id="panelSubscribers">
              <div className="admin-panel-header">
                <h1>Newsletter Subscribers</h1>
                <p>People who joined The Thread newsletter.</p>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Subscribed On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length > 0 ? (
                      subscribers.map((sub, i) => (
                        <tr key={sub.id}>
                          <td>{i + 1}</td>
                          <td>
                            <a href={`mailto:${sub.email}`} style={{ color: 'var(--color-gold-light)', textDecoration: 'none' }}>
                              <strong>{sub.email}</strong>
                            </a>
                          </td>
                          <td>{sub.name || '—'}</td>
                          <td>{new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="admin-empty">
                          <div className="admin-empty-icon"></div>
                          <div className="admin-empty-text">No subscribers yet</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages Panel */}
          {activePanel === 'messages' && (
            <div className="admin-panel active" id="panelMessages">
              <div className="admin-panel-header">
                <h1>Contact Messages</h1>
                <p>Messages from your audience and collaborators.</p>
              </div>

              <div className="admin-messages-list">
                {messages.length > 0 ? (
                  [...messages].reverse().map(msg => (
                    <div key={msg.id} className={`admin-message-card ${msg.read ? '' : 'unread'}`}>
                      <div className="admin-message-header">
                        <span className="admin-message-sender">{msg.name}</span>
                        <span className="admin-message-date">
                          {new Date(msg.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="admin-message-subject">{msg.subject}</div>
                      <div className="admin-message-body">{msg.message}</div>
                      <a 
                        href={`mailto:${msg.email}?subject=Reply:%20${encodeURIComponent(msg.subject)}`} 
                        className="admin-message-email" 
                        style={{ textDecoration: 'none', display: 'inline-block' }}
                      >
                         {msg.email}
                      </a>
                      {!msg.read && (
                        <div className="admin-message-actions">
                          <button 
                            className="action-btn" 
                            style={{ color: 'var(--color-gold-light)', border: '1px solid rgba(97,16,10,0.25)' }} 
                            onClick={() => handleMarkMessageRead(msg.id)}
                          >
                            Mark as Read
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="admin-empty">
                    <div className="admin-empty-icon"></div>
                    <div className="admin-empty-text">No messages yet</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Exit FAB */}
      <button className="admin-exit-fab" onClick={handleExit} title="Back to Main Site">
        <span className="admin-exit-fab-icon">←</span>
        <span className="admin-exit-fab-label">Exit</span>
      </button>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`} id="toast">
        {toast.message}
      </div>
    </div>
  );
}
