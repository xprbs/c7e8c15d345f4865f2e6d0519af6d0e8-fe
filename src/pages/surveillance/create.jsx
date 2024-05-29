import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  CardHeader,
  CardContent,
  InputAdornment,
  Grid,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  OutlinedInput,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Modal
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'
import Webcam from 'react-webcam'
import dynamic from 'next/dynamic'
import SurveillanceForm from 'src/views/pages/surveillance/SurveillanceForm'

function SurveillanceCreate() {
  const [isDisable, setIsDisable] = useState(false)
  const router = useRouter()

  async function createHandler(data, image) {
    setIsDisable(true)

    // const dataForm = JSON.stringify({
    //   dataAreaId: companyId.id,
    //   project_location: locationId.id,
    //   project_name: fields.project_name,
    //   project_category: 'Surveillance',
    //   project_date: fields.project_date,
    //   due_date: fields.due_date,
    //   risk,
    //   recommendation,
    //   finding,
    //   is_she: sheId.id,
    //   details: dataImage
    // })

    const form = new FormData()

    form.append('dataAreaId', data.dataAreaId)
    form.append('project_location', data.project_location)
    form.append('project_name', data.project_name)
    form.append('project_category', data.project_category)
    form.append('project_date', data.project_date)
    form.append('due_date', data.due_date)
    form.append('risk', data.risk)
    form.append('recommendation', data.recommendation)
    form.append('finding', data.finding)
    form.append('is_she', data.is_she)

    // form.append('dataAreaId', companyId.id)
    // form.append('project_location', locationId.id)
    // form.append('project_name', fields.project_name)
    // form.append('project_category', 'Surveillance')
    // form.append('project_date', fields.project_date)
    // form.append('due_date', fields.due_date)
    // form.append('risk', risk)
    // form.append('recommendation', recommendation)
    // form.append('finding', finding)
    // form.append('is_she', sheId.id)

    // form.append('details', JSON.stringify(dataImage))

    // dataImage.forEach((d, i) => {
    image.forEach((d, i) => {
      form.append(`details[${i}][image]`, d.image)
      form.append(`details[${i}][geo_location]`, d.geo_location)
      form.append(`details[${i}][description]`, d.description)
      form.append(`details[${i}][comment01]`, d.comment01)
      form.append(`details[${i}][comment02]`, d.comment02)
    })

    const myPromise = new Promise((resolve, reject) => {
      // backendApi.interceptors.request.use(config => {
      //   config.headers['Content-Type'] = `multipart/form-data`
      //   return config
      // })

      backendApi
        .post('/web/surveillance/store', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(res => {
          router.push('/surveillance')
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setIsDisable(false))
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully create data',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Create Project</Typography>} subtitle={null} />
      </Grid>
      <SurveillanceForm createHandler={createHandler} isDisable={isDisable} />
    </Grid>
  )
}

SurveillanceCreate.acl = {
  action: 'manage',
  subject: 'surveillance-create'
}

export default SurveillanceCreate
