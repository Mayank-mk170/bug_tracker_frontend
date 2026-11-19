
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bug,
  FolderKanban,
  User,
  CalendarDays,
  Clock,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import { getAllProjectIssues } from "../../services/issueService";

import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../../services/commentService";

export default function IssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const basePath =
    user?.role === "MANAGER" ? "/manager" : "/developer";

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentError, setCommentError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit comment states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete comment state
  const [deletingId, setDeletingId] = useState(null);

  // Fetch issue
  const fetchIssue = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const projects = await getMyProjects();
      const allIssues = await getAllProjectIssues(projects);

      const foundIssue = allIssues.find(
        (item) => item.id === issueId
      );

      if (!foundIssue) {
        setError("Issue not found or you don't have access to it.");
        return;
      }

      setIssue(foundIssue);
    } catch (err) {
      console.error("Issue details loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load issue details."
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const data = await getComments(issueId);
      setComments(data || []);
    } catch (err) {
      console.error("Comments loading error:", err);

      setCommentError(
        err.response?.data?.message ||
          "Unable to load comments."
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssue();
    fetchComments();
  }, [fetchIssue, fetchComments]);

  // Format dates
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();

    const content = commentContent.trim();

    if (!content) {
      setCommentError("Please enter a comment.");
      return;
    }

    try {
      setSubmitting(true);
      setCommentError("");

      await addComment(issueId, content);

      setCommentContent("");
      await fetchComments();
    } catch (err) {
      console.error("Add comment error:", err);

      setCommentError(
        err.response?.data?.message ||
          "Unable to add comment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setCommentError("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // Save edited comment
  const handleSaveEdit = async (commentId) => {
    const content = editContent.trim();

    if (!content) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    try {
      setSavingEdit(true);
      setCommentError("");

      await updateComment(issueId, commentId, content);

      setEditingCommentId(null);
      setEditContent("");

      await fetchComments();
    } catch (err) {
      console.error("Update comment error:", err);

      setCommentError(
        err.response?.data?.message ||
          "Unable to update comment."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(commentId);
      setCommentError("");

      await deleteComment(issueId, commentId);

      setComments((previousComments) =>
        previousComments.filter(
          (comment) => comment.id !== commentId
        )
      );
    } catch (err) {
      console.error("Delete comment error:", err);

      setCommentError(
        err.response?.data?.message ||
          "Unable to delete comment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const statusStyle = {
    TODO: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
  };

  const priorityStyle = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <RefreshCw
          size={28}
          className="animate-spin text-indigo-600"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={fetchIssue}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
          >
            Try Again
          </button>

          <button
            onClick={() => navigate(`${basePath}/issues`)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="space-y-6">

      {/* Back navigation */}
      <button
        onClick={() => navigate(`${basePath}/issues`)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Back to Issues
      </button>

      {/* Issue heading */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <Bug size={26} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Issue Details
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {issue.title}
              </h1>

              <p className="mt-2 break-all text-xs text-slate-400">
                Issue ID: {issue.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusStyle[issue.status] ||
                "bg-slate-100 text-slate-600"
              }`}
            >
              {issue.status?.replace("_", " ")}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                priorityStyle[issue.priority] ||
                "bg-slate-100 text-slate-600"
              }`}
            >
              {issue.priority}
            </span>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          Description
        </h2>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {issue.description || "No description provided."}
        </p>
      </section>

      {/* Issue information */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-slate-900">
            Issue Information
          </h2>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2.5 text-indigo-600">
                <FolderKanban size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Project</p>
                <p className="text-sm font-medium text-slate-800">
                  {issue.projectKey || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2.5 text-purple-600">
                <User size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Reporter</p>
                <p className="text-sm font-medium text-slate-800">
                  {issue.reporterEmail || "Not available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600">
                <User size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Assigned Developer
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {issue.assigneeEmail || "Unassigned"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-slate-900">
            Timeline
          </h2>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2.5 text-green-600">
                <CalendarDays size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Created At</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(issue.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2.5 text-orange-600">
                <Clock size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(issue.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Comments Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" />

              <h2 className="text-lg font-semibold text-slate-900">
                Comments
              </h2>

              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {comments.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Discuss this issue with your project team.
            </p>
          </div>

          <button
            onClick={fetchComments}
            disabled={commentsLoading}
            title="Refresh comments"
            className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={commentsLoading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Comment error */}
        {commentError && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} />
            <p>{commentError}</p>
          </div>
        )}

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Add a comment
          </label>

          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write your comment here..."
            maxLength={1000}
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-200 p-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              {commentContent.length}/1000 characters
            </p>

            <button
              type="submit"
              disabled={submitting || !commentContent.trim()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        <div className="border-t border-slate-100 pt-6">

          <h3 className="mb-5 text-sm font-semibold text-slate-800">
            Discussion
          </h3>

          {commentsLoading ? (
            <div className="py-10 text-center">
              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-2 text-sm text-slate-500">
                Loading comments...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
              <MessageSquare
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                No comments yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Be the first to comment on this issue.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => {
                // Allow each user to manage only their own comments.
                // AuthContext stores the signed-in user's email in user.email.
                const currentUserEmail = String(
                  user?.email || user?.userEmail || ""
                ).trim().toLowerCase();

                const commentOwnerEmail = String(
                  comment?.userEmail || ""
                ).trim().toLowerCase();

                const isOwner =
                  currentUserEmail.length > 0 &&
                  commentOwnerEmail.length > 0 &&
                  currentUserEmail === commentOwnerEmail;

                // Keep the existing Manager controls and enable the same
                // controls for Developers on their own comments.
                const canManageComment =
                  isOwner &&
                  (user?.role === "MANAGER" || user?.role === "DEVELOPER");

                const isEditing =
                  editingCommentId === comment.id;

                return (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold uppercase text-indigo-700">
                          {comment.userEmail?.charAt(0) || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {comment.userEmail}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatDate(comment.createdAt)}

                            {comment.updatedAt &&
                              comment.createdAt !== comment.updatedAt &&
                              " · Edited"}
                          </p>
                        </div>
                      </div>

                      {/* Owner actions */}
                      {canManageComment && !isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            title="Edit comment"
                            className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteComment(comment.id)
                            }
                            disabled={deletingId === comment.id}
                            title="Delete comment"
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Edit form */}
                    {isEditing ? (
                      <div className="mt-4">
                        <textarea
                          value={editContent}
                          onChange={(e) =>
                            setEditContent(e.target.value)
                          }
                          maxLength={1000}
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500"
                        />

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs text-slate-400">
                            {editContent.length}/1000 characters
                          </span>

                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelEdit}
                              disabled={savingEdit}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <X size={14} />
                              Cancel
                            </button>

                            <button
                              onClick={() =>
                                handleSaveEdit(comment.id)
                              }
                              disabled={
                                savingEdit || !editContent.trim()
                              }
                              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {savingEdit ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {comment.content}
                      </p>
                    )}

                    {deletingId === comment.id && (
                      <p className="mt-2 text-xs text-red-500">
                        Deleting comment...
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
