package com.cc91.repository;

import com.cc91.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 公告数据访问层
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * 查询所有公告（置顶优先，时间倒序），JOIN FETCH 避免 N+1
     */
    @Query("SELECT a FROM Announcement a JOIN FETCH a.author ORDER BY a.isPinned DESC, a.createdAt DESC")
    List<Announcement> findAllWithAuthor();

    /**
     * 根据 ID 查询公告，JOIN FETCH 避免 N+1
     */
    @Query("SELECT a FROM Announcement a JOIN FETCH a.author WHERE a.id = :id")
    Optional<Announcement> findByIdWithAuthor(Long id);
}
