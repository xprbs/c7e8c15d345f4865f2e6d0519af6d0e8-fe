/* eslint-disable react-hooks/rules-of-hooks */
// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  CardHeader,
  CardContent,
  Menu,
  MenuItem,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  DialogContentText,
  DialogActions,
  Autocomplete,
  FormHelperText,
  Paper
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import dynamic from 'next/dynamic'
import SurveillanceDetail from 'src/views/pages/surveillance/SurveillanceDetail'

var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
  ssr: false
})

const schema = yup.object().shape({
  question_answer_description: yup.string().required('Description is a required field'),
  question_answer_uid: yup.string().required('Answer Master is a required field')
})

const detailSurveillance = () => {
  const router = useRouter()
  const { id } = router.query

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [dataSurveillance, setDataSurveillance] = useState([])

  const getData = async () => {
    setSkeleton(true)
    setSkeleton2(true)

    const dataForm = JSON.stringify({
      project_uid: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/surveillance/detail', dataForm)
        .then(res => {
          resolve('success')
          setDataSurveillance(res.data.data)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setSkeleton(false)
        })
    })
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Surveillance Follow Up</Typography>} subtitle={null} />
        {skeleton ? (
          <Grid>
            <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
            <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
          </Grid>
        ) : (
          <SurveillanceDetail detail={dataSurveillance} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TextField
              name={'answer_description'}
              multiline
              rows={3}
              fullWidth
              label='Note'
              size='small'
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 350, mt: 2 }}
              // onChange={e => handleChange(e, index)}
              // defaultValue={selectedDetail
              //   .map(e => (e.id === data.question_detail_uid ? e.answer_description : null))
              //   .join('')}
            />
            <input onChange={e => onChangeUploadFile(e, index)} type='file' name='file' multiple />
            <Box
              sx={{
                gap: 5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'left',
                marginTop:5
              }}
            >
              <Button component={Link} href={'/audit-checklist'} variant='outlined' size='small'>
                Back
              </Button>
              <Button variant='contained' size='small' disabled={isDisable}>
                Follow Up
                {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

detailSurveillance.acl = {
  action: 'manage',
  subject: 'surveillance-follow-up'
}

export default detailSurveillance
