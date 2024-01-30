import React, { useEffect, useState } from 'react'

import {
  CardHeader,
  CardContent,
  InputAdornment,
  Grid,
  Card,
  TextField,
  Box,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'

const schema = yup.object().shape({
  question_name: yup.string().required('Template Name is a required field'),
  question_type: yup.string().required('Category is a required field')
})

function AuditIsoCreate() {
  const [isDisable, setIsDisable] = useState(false)
  const [auditCategory, setAuditCategory] = useState([])
  const [auditCategoryId, setAuditCategoryId] = useState(null)

  const [fields, setFields] = useState({
    question_name: null,
    question_type: auditCategoryId
  })

  const router = useRouter()

  const fieldHandler = e => {
    const name = e.target.name
    const value = e.target.value

    setFields({
      ...fields,
      [name]: value
    })
  }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  async function createHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      question_name: fields.question_name,
      question_type: auditCategoryId.id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/store', dataForm)
        .then(res => {
          router.push('/question-template')
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

  async function getInit() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-audit-category')
        .then(res => {
          setAuditCategory(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Create Template</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={null} />
          <CardContent>
            <form onSubmit={handleSubmit(createHandler)}>
              <Grid container spacing={8}>
                <Grid container item md={6} xs={12} rowSpacing={8}>
                  <Grid item xs={12}>
                    <TextField
                      {...register('question_name')}
                      onChange={fieldHandler}
                      fullWidth
                      name='question_name'
                      label='Template Name'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.question_name)}
                      helperText={errors.question_name && errors.question_name.message}
                    />
                  </Grid>
                </Grid>
                <Grid container item md={6} xs={12} rowSpacing={8}>
                  <Grid container item spacing={6}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          size='small'
                          options={auditCategory}
                          fullWidth
                          renderInput={params => (
                            <TextField
                              {...params}
                              {...register('question_type')}
                              label='Question Category'
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(errors.question_type)}
                            />
                          )}
                          onChange={(event, newValue) => {
                            setAuditCategoryId(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={auditCategoryId}
                        />
                        {errors.question_type && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.question_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      gap: 5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'left'
                    }}
                  >
                    <Button component={Link} href={'/question-template'} variant='outlined' size='small'>
                      Back
                    </Button>
                    <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                      Save
                      {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

AuditIsoCreate.acl = {
  action: 'manage',
  subject: 'audit-iso-create'
}

export default AuditIsoCreate
