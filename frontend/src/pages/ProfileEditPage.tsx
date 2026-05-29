import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateProfile, uploadAvatar } from '../api/user';
import { queryKeys } from '../lib/queryKeys';
import Breadcrumbs from '../components/Breadcrumbs';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function ProfileEditPage() {
  const { user, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (profile) {
      setCurrentAvatarUrl(profile.avatarUrl || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let finalAvatarUrl = currentAvatarUrl;
      let uploadedUrl: string | null = null;
      if (selectedFile) {
        uploadedUrl = await uploadAvatar(selectedFile);
        finalAvatarUrl = uploadedUrl;
      }
      try {
        return await updateProfile({
          avatarUrl: finalAvatarUrl || undefined,
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
          website: website.trim() || undefined,
        });
      } catch (err) {
        // Profile update failed — uploaded file is orphaned, but we can't
        // reliably delete it from the frontend. Best-effort: leave cleanup
        // to a future garbage-collection mechanism or admin intervention.
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      if (user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.username) });
        // Avatar changed — invalidate posts/comments so they re-fetch with new URL
        queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
        updateUserAvatar(data.avatarUrl ?? null);
        navigate(`/profile/${user.username}`);
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || '更新失败，请重试');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('仅支持 JPG、PNG、WebP 格式的图片');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('文件大小不能超过 2MB');
      return;
    }

    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    updateMutation.mutate();
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (user) {
      navigate(`/profile/${user.username}`);
    }
  };

  const displayAvatarUrl = previewUrl || (currentAvatarUrl || undefined);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div className="cc98-editor-page container" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
      <Breadcrumbs
        items={[
          { label: '版面列表', href: '/' },
          { label: '个人中心', href: '/dashboard' },
          { label: '修改资料设置' }
        ]}
      />

      <div className="cc98-editor-card">
        <div className="cc98-editor-title-bar">
          <i className="fa fa-user-circle-o"></i> 修改个人名片设置
        </div>

        {error && (
          <div className="cc98-error-box" style={{ margin: '1.25rem 1.5rem 0 1.5rem' }}>
            <i className="fa fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* 头像上传 */}
          <div className="cc98-form-group">
            <label>头像</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                flexShrink: 0,
                background: 'var(--bg-secondary, #f0f0f0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt="头像预览"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <i className="fa fa-user" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}></i>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="cc98-btn btn-publish"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updateMutation.isPending}
                >
                  <i className="fa fa-upload"></i> 选择图片
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    className="cc98-btn btn-cancel"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                    onClick={handleRemoveFile}
                    disabled={updateMutation.isPending}
                  >
                    取消选择
                  </button>
                )}
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  支持 JPG、PNG、WebP，不超过 2MB
                </small>
              </div>
            </div>
          </div>

          {/* 个人签名 bio */}
          <div className="cc98-form-group" style={{ position: 'relative' }}>
            <label htmlFor="bio">个人签名</label>
            <span style={{ position: 'absolute', right: 0, top: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              (<span className="count-hint">{bio.length}/500</span>)
            </span>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="介绍一下你自己，或者写一句个性的签名档..."
              className="cc98-form-control"
              maxLength={500}
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          {/* 所在地 */}
          <div className="cc98-form-group">
            <label htmlFor="location">所在地</label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="例如：杭州求是园"
              className="cc98-form-control"
              maxLength={100}
            />
          </div>

          {/* 个人网站 */}
          <div className="cc98-form-group">
            <label htmlFor="website">个人网站</label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="https://yourwebsite.com"
              className="cc98-form-control"
            />
          </div>

          {/* 操作按钮 */}
          <div className="cc98-editor-actions">
            <button
              type="submit"
              className="cc98-btn btn-publish"
              disabled={updateMutation.isPending}
            >
              <i className="fa fa-check"></i> {updateMutation.isPending ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="cc98-btn btn-cancel"
              disabled={updateMutation.isPending}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
