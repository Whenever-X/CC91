import { NavLink, useNavigate } from 'react-router-dom';

export default function PersonalSidebar() {
  const navigate = useNavigate();
  const menuItems = [
    { name: '我的帖子', path: '/dashboard/posts', icon: 'fa-file-text-o' },
    { name: '我的回复', path: '/dashboard/comments', icon: 'fa-comments-o' },
    { name: '我的收藏', path: '/dashboard/bookmarks', icon: 'fa-star-o' },
    { name: '我的草稿', path: '/dashboard/drafts', icon: 'fa-pencil-square-o' },
    { name: '安全设置', path: '/dashboard/password', icon: 'fa-lock' },
    { name: '个人中心', path: '/dashboard', icon: 'fa-user-circle-o', end: true },
  ];

  return (
    <aside className="cc98-personal-sidebar">
      <div className="sidebar-header">
        <h3>个人中心</h3>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          >
            <i className={`fa ${item.icon}`}></i>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <style>{`
        .cc98-personal-sidebar {
          width: 200px;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--cc98-radius);
          box-shadow: var(--cc98-shadow);
          padding: 1.25rem 0;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: fit-content;
        }

        .cc98-personal-sidebar .sidebar-header {
          padding: 0 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.75rem;
        }

        .cc98-personal-sidebar .sidebar-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-main);
          font-weight: bold;
        }

        .cc98-personal-sidebar .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cc98-personal-sidebar .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: var(--cc98-transition);
          border-left: 3px solid transparent;
        }

        .cc98-personal-sidebar .sidebar-link:hover {
          color: var(--primary-color);
          background-color: var(--quote-bg);
        }

        .cc98-personal-sidebar .sidebar-link.active {
          color: var(--primary-color);
          background-color: var(--quote-bg);
          border-left-color: var(--primary-color);
          font-weight: bold;
        }
      `}</style>
    </aside>
  );
}
