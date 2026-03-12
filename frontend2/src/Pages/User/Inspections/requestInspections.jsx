import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  EditCalendar as EditCalendarIcon,
} from "@mui/icons-material";
import api from "../../../services/api/apiClient";

const MyInspections = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Reschedule dialog
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM");

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const showSnack = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusMeta = useMemo(
    () => ({
      approved: { color: "success", icon: <CheckCircleIcon fontSize="small" /> },
      pending: { color: "warning", icon: <PendingIcon fontSize="small" /> },
      rejected: { color: "error", icon: <CancelIcon fontSize="small" /> },
      completed: { color: "info", icon: <ScheduleIcon fontSize="small" /> },
      cancelled: { color: "default", icon: <CancelIcon fontSize="small" /> },
    }),
    []
  );

  const getStatusColor = (status) => statusMeta?.[status]?.color || "default";
  const getStatusIcon = (status) =>
    statusMeta?.[status]?.icon || <CalendarIcon fontSize="small" />;

  const getStepper = (status) => {
    // Simple flow:
    // Requested (pending) -> Approved/Rejected -> Completed
    const steps = ["Requested", "Agent Review", "Approved", "Completed"];

    if (status === "pending") return { steps, activeStep: 1 };
    if (status === "approved") return { steps, activeStep: 2 };
    if (status === "completed") return { steps, activeStep: 3 };
    if (status === "rejected") return { steps: ["Requested", "Agent Review", "Rejected"], activeStep: 2 };
    if (status === "cancelled") return { steps: ["Requested", "Cancelled"], activeStep: 1 };

    return { steps, activeStep: 0 };
  };

  const fetchInspections = async () => {
    setLoading(true);
    setPageError(null);

    try {
      const res = await api.get("/inspections/my-inspections");
      setInspections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching inspections:", err);
      setPageError(err?.response?.data?.message || "Failed to load inspections. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelInspection = async (requestId) => {
    try {
      setActionLoadingId(requestId);
      await api.delete(`/inspections/${requestId}`);

      // Update UI instantly
      setInspections((prev) =>
        prev.map((i) => (i._id === requestId ? { ...i, status: "cancelled" } : i))
      );

      showSnack("Inspection request cancelled ✅", "success");
    } catch (err) {
      console.error("Cancel inspection failed:", err);
      showSnack(err?.response?.data?.message || "Failed to cancel request", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openReschedule = (inspection) => {
    setSelectedInspection(inspection);
    // Pre-fill with existing values if present
    const existingDate = inspection?.date ? new Date(inspection.date) : null;
    const yyyyMmDd =
      existingDate && !Number.isNaN(existingDate.getTime())
        ? existingDate.toISOString().slice(0, 10)
        : "";
    setNewDate(yyyyMmDd);
    setNewTime(inspection?.time || "10:00 AM");
    setRescheduleOpen(true);
  };

  const submitReschedule = async () => {
    if (!selectedInspection?._id) return;

    if (!newDate) {
      showSnack("Please select a new date", "error");
      return;
    }

    try {
      setActionLoadingId(selectedInspection._id);

      const res = await api.put(`/inspections/${selectedInspection._id}/reschedule`, {
        date: newDate,
        time: newTime,
      });

      // Your controller returns: { message, request }
      const updated = res?.data?.request;

      if (updated?._id) {
        setInspections((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      } else {
        // fallback: refetch
        await fetchInspections();
      }

      setRescheduleOpen(false);
      setSelectedInspection(null);
      showSnack("Inspection rescheduled ✅", "success");
    } catch (err) {
      console.error("Reschedule failed:", err);
      showSnack(err?.response?.data?.message || "Failed to reschedule", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            My Inspection Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your inspection requests and their approval status.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={fetchInspections} startIcon={<CalendarIcon />}>
          Refresh
        </Button>
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {inspections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inspection requests yet
          </Typography>
          <Button variant="contained" component={Link} to="/properties" sx={{ mt: 2 }} startIcon={<HomeIcon />}>
            Browse Properties
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {inspections.map((inspection) => {
            const apt = inspection.apartment;
            const agent = inspection.agent;

            const baseURL = "http://localhost:5006";

              const cover = apt?.images?.[0]
                ? `${baseURL}/uploads/apartments/${apt.images[0]}`
                : "https://via.placeholder.com/900x600?text=No+Image";

            const status = inspection.status || "pending";
            const { steps, activeStep } = getStepper(status);

            const isPending = status === "pending";
            const isBusy = actionLoadingId === inspection._id;

            return (
              <Grid item xs={12} key={inspection._id}>
                <Card sx={{ overflow: "hidden" }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Image */}
                      <Grid item xs={12} md={3}>
                        <Box
                          component="img"
                          src={cover}
                          alt={apt?.location || "Property"}
                          sx={{
                            width: "100%",
                            height: isMobile ? 220 : 160,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            bgcolor: "grey.100",
                          }}
                        />
                      </Grid>

                      {/* Details */}
                      <Grid item xs={12} md={9}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap title={apt?.location || ""}>
                              {apt?.location || "N/A"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              Agent: <strong>{agent?.name || "N/A"}</strong>
                              {agent?.phone ? ` • ${agent.phone}` : ""}
                            </Typography>
                          </Box>

                          <Chip
                            icon={getStatusIcon(status)}
                            label={String(status).toUpperCase()}
                            color={getStatusColor(status)}
                            variant="filled"
                          />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Dates */}
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Requested On
                            </Typography>
                            <Typography variant="body2">{formatDate(inspection.createdAt)}</Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Inspection Date
                            </Typography>
                            <Typography variant="body2">{formatDate(inspection.date)}</Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Time
                            </Typography>
                            <Typography variant="body2">{inspection.time || "10:00 AM"}</Typography>
                          </Grid>

                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Status
                            </Typography>
                            <Typography variant="body2">{status}</Typography>
                          </Grid>
                        </Grid>

                        {/* Stepper */}
                        <Box sx={{ mt: 2 }}>
                          <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
                            {steps.map((label) => (
                              <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>

                        {/* Message */}
                        {inspection.message && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Your Message
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                              {inspection.message}
                            </Typography>
                          </Box>
                        )}

                        {/* Rejection reason */}
                        {status === "rejected" && inspection.rejectionReason && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: "error.50", borderRadius: 1.5 }}>
                            <Typography variant="caption" color="error.main" display="block">
                              Rejection Reason
                            </Typography>
                            <Typography variant="body2">{inspection.rejectionReason}</Typography>
                          </Box>
                        )}

                        {/* Actions */}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2, flexWrap: "wrap" }}>
                          <Button
                            size="small"
                            component={Link}
                            to={`/properties/${apt?._id}`}
                            disabled={!apt?._id}
                          >
                            View Property
                          </Button>

                          {isPending && (
                            <>
                              <Tooltip title="Reschedule this request">
                                <span>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<EditCalendarIcon />}
                                    onClick={() => openReschedule(inspection)}
                                    disabled={isBusy}
                                  >
                                    {isBusy ? "Please wait..." : "Reschedule"}
                                  </Button>
                                </span>
                              </Tooltip>

                              <Tooltip title="Cancel this request">
                                <span>
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="contained"
                                    startIcon={<CancelIcon />}
                                    onClick={() => cancelInspection(inspection._id)}
                                    disabled={isBusy}
                                  >
                                    {isBusy ? "Cancelling..." : "Cancel"}
                                  </Button>
                                </span>
                              </Tooltip>
                            </>
                          )}

                          {status === "approved" && (
                            <Chip
                              icon={<CheckCircleIcon fontSize="small" />}
                              label="Approved ✅"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Reschedule Inspection
          <IconButton onClick={() => setRescheduleOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pick a new date/time. This will reset the request to <strong>pending</strong> for agent approval.
          </Typography>

          <TextField
            fullWidth
            type="date"
            label="New Date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="New Time (text)"
            placeholder="e.g. 10:00 AM"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitReschedule}
            disabled={!newDate || actionLoadingId === selectedInspection?._id}
          >
            {actionLoadingId === selectedInspection?._id ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyInspections;