import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/post';
import reportService, { ReportResponse } from '../../services/report';
import Avatar from '../atoms/Avatar';

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const fetchedReports = await reportService.getReports(statusFilter || undefined);
        
        // For reports with post IDs, fetch the post details if not already included
        const reportsWithDetails = await Promise.all(
          fetchedReports.map(async (report) => {
            if (report.reportedPostId && !report.reportedPost) {
              try {
                const postDetails = await postService.getPosts();
                const reportedPost = postDetails.find(p => p.id === report.reportedPostId);
                return { ...report, reportedPost };
              } catch (error) {
                console.error(`Error fetching post details for report ${report.id}:`, error);
                return report;
              }
            }
            return report;
          })
        );
        
        setReports(reportsWithDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchReports();
    } else {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [user, statusFilter]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      setIsUpdating(prev => ({ ...prev, [reportId]: true }));
      await reportService.updateReportStatus(reportId, newStatus);
      
      // Update the local state
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status. Please try again.');
    } finally {
      setIsUpdating(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleViewReportedPost = (postId: number) => {
    window.open(`/post/${postId}`, '_blank');
  };

  const handleViewReportedUser = (userId: number) => {
    window.open(`/profile/${userId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Report Management</h1>
      
      <div className="mb-4 flex items-center">
        <label htmlFor="status-filter" className="mr-2 text-gray-700 dark:text-gray-300">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusChange}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-pink-500 focus:outline-none dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
        >
          <option value="">All Reports</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>
      
      {reports.length === 0 ? (
        <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-700 dark:bg-neutral-700 dark:text-gray-300">
          No reports found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Reporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Reported Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-neutral-900">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {report.id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      
                        <button 
                          onClick={() => handleViewReportedUser(report.reporterId as number)}
                          className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400"
                        >
                          View User (ID: {report.reporterId})
                        </button>
                     
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {report.reportedPost ? (
                      <div className="max-w-md">
                        <div className="flex items-center">
                          {report.reportedPost.author && (
                            <div className="flex items-center">
                              <div 
                                className="h-8 w-8 flex-shrink-0 cursor-pointer"
                                onClick={() => report.reportedPost?.author?.id && handleViewReportedUser(report.reportedPost?.author?.id)}
                              >
                                <Avatar
                                  src={report.reportedPost.author.avatarUrl}
                                  alt={report.reportedPost.author.fullName}
                                  size="sm"
                                />
                              </div>
                              <div 
                                className="ml-2 text-sm font-medium  cursor-pointer text-pink-500 hover:text-pink-700 dark:hover:text-pink-400"
                                onClick={() => report.reportedPost?.author?.id && handleViewReportedUser(report.reportedPost?.author?.id)}
                              >
                                {report.reportedPost.author.fullName}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                            {report.reportedPost.content}
                          </p>
                          {report.reportedPost.mediaUrls && report.reportedPost.mediaUrls.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {report.reportedPost.mediaUrls.map((url, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={url}
                                    alt={`Media ${index + 1}`}
                                    className="w-full rounded object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : report.reportedPostId ? (
                      <div className="text-gray-500">
                        Post content not available (ID: {report.reportedPostId})
                      </div>
                    ) : report.reportedUserId ? (
                      <button 
                        onClick={() => handleViewReportedUser(report.reportedUserId!)}
                        className="text-pink-500 hover:text-pink-700 dark:hover:text-pink-400"
                      >
                        View User (ID: {report.reportedUserId})
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="max-w-xs overflow-hidden text-ellipsis">{report.reason}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                      report.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                      report.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      {report.status !== 'REVIEWED' && report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                          disabled={isUpdating[report.id]}
                          className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:bg-blue-300"
                        >
                          {isUpdating[report.id] ? 'Updating...' : 'Mark as Reviewed'}
                        </button>
                      )}
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                          disabled={isUpdating[report.id]}
                          className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600 disabled:bg-green-300"
                        >
                          {isUpdating[report.id] ? 'Updating...' : 'Resolve'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportManagement; 