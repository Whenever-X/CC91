import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/user';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const changeMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || '密码修改失败，请重试');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('新密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    changeMutation.mutate({ oldPassword, newPassword });
  };

  return (
    <div className="cc98-editor-page container" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
      <Breadcrumbs
        items={[
          { label: '论坛首页', href: '/' },
          { label: '个人中心', href: '/dashboard' },
          { label: '修改密码' }
        ]}
      />

      <div className="cc98-editor-card">
        <div className="cc98-editor-title-bar">
          <i className="fa fa-lock"></i> 修改密码
        </div>

        {error && (
          <div className="cc98-error-box" style={{ margin: '1.25rem 1.5rem 0 1.5rem' }}>
            <i className="fa fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="cc98-form-group">
            <label htmlFor="oldPassword">当前密码</label>
            <input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={changeMutation.isPending}
              placeholder="请输入当前密码"
              className="cc98-form-control"
              required
            />
          </div>

          <div className="cc98-form-group">
            <label htmlFor="newPassword">新密码</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={changeMutation.isPending}
              placeholder="请输入新密码（至少 6 位）"
              className="cc98-form-control"
              required
              minLength={6}
            />
          </div>

          <div className="cc98-form-group">
            <label htmlFor="confirmPassword">确认新密码</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={changeMutation.isPending}
              placeholder="请再次输入新密码"
              className="cc98-form-control"
              required
              minLength={6}
            />
          </div>

          <div className="cc98-editor-actions">
            <button
              type="submit"
              className="cc98-btn btn-publish"
              disabled={changeMutation.isPending}
            >
              <i className="fa fa-check"></i> {changeMutation.isPending ? '修改中...' : '确认修改'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cc98-btn btn-cancel"
              disabled={changeMutation.isPending}
            >
              返回
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
