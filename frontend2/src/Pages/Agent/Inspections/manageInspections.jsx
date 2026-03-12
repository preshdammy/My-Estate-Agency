import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from "@mui/material";
import { Link } from "react-router-dom"; // Add this import

import {
  Check as CheckIcon,
  Close as CloseIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon // Add this import
} from "@mui/icons-material";

import api from "../../../services/api/apiClient";

const ManageInspections = () => {

  const [inspections,setInspections] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState(null)

  const [selectedInspection,setSelectedInspection] = useState(null)
  const [dialogOpen,setDialogOpen] = useState(false)
  const [actionType,setActionType] = useState("")
  const [rejectionReason,setRejectionReason] = useState("")

  useEffect(()=>{
    fetchInspections()
  },[])

  const fetchInspections = async () => {

    setLoading(true)

    try{

      const res = await api.get("/inspections/agent/requests")

      setInspections(res.data)

    }catch(err){

      console.error(err)
      setError("Failed to load inspections")

    }finally{

      setLoading(false)

    }

  }

  const approveInspection = async (id) => {

    await api.put(`/inspections/agent/${id}/status`,{
      status:"approved"
    })

    fetchInspections()

  }

  const rejectInspection = async () => {

    await api.put(`/inspections/agent/${selectedInspection._id}/status`,{
      status:"rejected",
      rejectionReason
    })

    setDialogOpen(false)
    setRejectionReason("")
    fetchInspections()

  }

  const completeInspection = async (id) => {

    await api.put(`/inspections/agent/${id}/complete`)

    fetchInspections()

  }

  const formatDate = (date)=>{

    return new Date(date).toLocaleDateString()

  }

  const statusColor = (status)=>{

    switch(status){

      case "pending": return "warning"
      case "approved": return "info"
      case "rejected": return "error"
      case "completed": return "success"
      default: return "default"

    }

  }

  if(loading)
    return(
      <Box sx={{display:"flex",justifyContent:"center",mt:10}}>
        <CircularProgress/>
      </Box>
    )

  return(

  <Container maxWidth="lg" sx={{py:4}}>

    <Typography variant="h4" gutterBottom>

      Inspection Requests

    </Typography>

    {error && <Alert severity="error">{error}</Alert>}

    {inspections.length===0 ?

      <Paper sx={{p:4,textAlign:"center"}}>

        <Typography>No inspection requests yet</Typography>

      </Paper>

      :

      <Grid container spacing={3}>

        {inspections.map((inspection)=>(

          <Grid item xs={12} key={inspection._id}>

            <Card>

              <CardContent>

                <Grid container spacing={2} alignItems="center">

                  <Grid item xs={12} md={3}>

                    <Typography fontWeight="bold">

                      {inspection.apartment?.location}

                    </Typography>

                    <Typography variant="caption">

                      Property

                    </Typography>

                  </Grid>

                  <Grid item xs={12} md={3}>

                    <Box sx={{display:"flex",alignItems:"center",gap:1}}>

                      <Avatar>

                        {inspection.user?.name?.charAt(0)}

                      </Avatar>

                      <Box>

                        <Typography>

                          {inspection.user?.name}

                        </Typography>

                        <Typography variant="caption">

                          {inspection.user?.email}

                        </Typography>

                      </Box>

                    </Box>

                  </Grid>

                  <Grid item xs={12} md={2}>

                    <Typography>

                      {formatDate(inspection.date)}

                    </Typography>

                  </Grid>

                  <Grid item xs={12} md={2}>

                    <Chip

                      label={inspection.status}

                      color={statusColor(inspection.status)}

                    />

                  </Grid>

                  <Grid item xs={12} md={2}>

                    {inspection.status==="pending" && (

                      <>

                        <Tooltip title="Approve">

                          <IconButton

                            color="success"

                            onClick={()=>approveInspection(inspection._id)}

                          >

                            <CheckIcon/>

                          </IconButton>

                        </Tooltip>

                        <Tooltip title="Reject">

                          <IconButton

                            color="error"

                            onClick={()=>{

                              setSelectedInspection(inspection)

                              setDialogOpen(true)

                            }}

                          >

                            <CloseIcon/>

                          </IconButton>

                        </Tooltip>

                      </>

                    )}

                    {inspection.status==="approved" && (

                      <Tooltip title="Mark Completed">

                        <IconButton

                          color="success"

                          onClick={()=>completeInspection(inspection._id)}

                        >

                          <CompleteIcon/>

                        </IconButton>

                      </Tooltip>

                    )}

                    {/* Add Visibility Icon for All Statuses */}
                    <Tooltip title="View Details">

                      <IconButton

                        color="primary"

                        component={Link}
                        to={`/agent/inspections/${inspection._id}`}

                      >

                        <VisibilityIcon/>

                      </IconButton>

                    </Tooltip>

                  </Grid>

                </Grid>

                {inspection.message && (

                  <Box sx={{mt:2,p:2,background:"#f5f5f5"}}>

                    <Typography variant="caption">

                      Client Message

                    </Typography>

                    <Typography>

                      {inspection.message}

                    </Typography>

                  </Box>

                )}

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>

    }

    <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)}>

      <DialogTitle>Reject Inspection</DialogTitle>

      <DialogContent>

        <TextField

          fullWidth

          multiline

          rows={3}

          label="Reason for rejection"

          value={rejectionReason}

          onChange={(e)=>setRejectionReason(e.target.value)}

        />

      </DialogContent>

      <DialogActions>

        <Button onClick={()=>setDialogOpen(false)}>

          Cancel

        </Button>

        <Button

          color="error"

          variant="contained"

          onClick={rejectInspection}

        >

          Reject

        </Button>

      </DialogActions>

    </Dialog>

  </Container>

  )

}

export default ManageInspections