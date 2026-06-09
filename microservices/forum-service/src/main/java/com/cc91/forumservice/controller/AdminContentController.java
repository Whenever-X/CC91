package com.cc91.forumservice.controller;

import com.cc91.forumservice.client.CreateNotificationRequest;
import com.cc91.forumservice.client.NotificationServiceClient;
import com.cc91.forumservice.dto.ApiResponse;
import com.cc91.forumservice.dto.PostResponse;
import com.cc91.forumservice.dto.UpdatePostStatusRequest;
import com.cc91.forumservice.entity.Comment;
import com.cc91.forumservice.entity.Post;
import com.cc91.forumservice.exception.ResourceNotFoundException;
import com.cc91.forumservice.repository.CommentRepository;
import com.cc91.forumservice.repository.PostRepository;
import com.cc91.forumservice.service.PostService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContentController {

    private static final Logger logger = LoggerFactory.getLogger(AdminContentController.class);

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostService postService;
    private final NotificationServiceClient notificationServiceClient;

    public AdminContentController(PostRepository postRepository,
                                  CommentRepository commentRepository,
                                  PostService postService,
                                  NotificationServiceClient notificationServiceClient) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.notificationServiceClient = notificationServiceClient;
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostResponse>> getPostsByStatus(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<PostResponse> response = postService.getPostList(page, size, status);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/posts/{id}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> updatePostStatus(
            @PathVariable Long id,
            @RequestBody UpdatePostStatusRequest request
    ) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("帖子不存在"));

        post.setStatus(request.getStatus());
        postRepository.save(post);

        try {
            notificationServiceClient.createNotification(new CreateNotificationRequest(
                    post.getAuthorId(), "POST_STATUS", "帖子状态变更",
                    "您的帖子「" + post.getTitle() + "」状态已变更为：" + request.getStatus(),
                    post.getId()
            ));
        } catch (Exception e) {
            logger.warn("通知发送失败: postId={}", id, e);
        }

        logger.info("管理员修改帖子状态: id={}, status={}", id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("帖子状态已更新"));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> forceDeletePost(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("帖子不存在"));
        postRepository.delete(post);
        logger.info("管理员强制删除帖子: id={}", id);
        return ResponseEntity.ok(ApiResponse.success("帖子已删除"));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> forceDeleteComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("评论不存在"));
        commentRepository.delete(comment);
        logger.info("管理员强制删除评论: id={}", id);
        return ResponseEntity.ok(ApiResponse.success("评论已删除"));
    }
}
