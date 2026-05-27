import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateProfile } from '../api/user';
import { queryKeys } from '../lib/queryKeys';
import Breadcrumbs from '../components/Breadcrumbs';

/**
 * CC98 风格编辑个人资料页面组件
 */
export default function ProfileEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  // 获取当前资料的 Query
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getMyProfile,
  });

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatarUrl || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  // 更新资料的 Mutation
  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      if (user) {
        navigate(`/profile/${user.username}`);
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || '更新失败，请重试');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    updateMutation.mutate({
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim() || undefined,
      location: location.trim() || undefined,
      website: website.trim() || undefined,
    });
  };

  const handleCancel = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
  };

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
      {/* 1. 面包屑 */}
      <Breadcrumbs
        items={[
          { label: '版面列表', href: '/' },
          { label: '个人中心', href: '/dashboard' },
          { label: '修改资料设置' }
        ]}
      />

      {/* 2. 编辑卡片 */}
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
          {/* 头像 URL */}
          <div className="cc98-form-group">
            <label htmlFor="avatarUrl">
              头像 URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={updateMutation.isPending}
              placeholder="https://example.com/avatar.jpg"
              className="cc98-form-control"
            />
            <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
              请输入论坛可访问的图片 URL。如不填写，论坛将根据您的用户名生成默认萌物头像。
            </small>
          </div>

          {/* 头像预览 */}
          {avatarUrl && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto',
                border: '2px solid var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={avatarUrl}
                  alt="头像预览"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setError('预览图片加载失败，请检查 URL 是否有效')}
                />
              </div>
            </div>
          )}

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
