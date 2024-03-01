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
  audit_name: yup.string().required('Project Name is a required field'),
  audit_ref: yup.string().required('Document Reference is a required field'),
  audit_category: yup.string().required('Category is a required field'),
  company: yup.string().required('Company is a required field'),
  audit_location: yup.string().required('Department is a required field'),
  question_uid: yup.string().required('Question Template is a required field')
})

function AuditIsoCreate() {
  const [isDisable, setIsDisable] = useState(false)
  const [department, setDepartment] = useState([])
  const [question, setQuestion] = useState([])
  const [locationId, setLocationId] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const [auditCategory, setAuditCategory] = useState([])
  const [auditCategoryId, setAuditCategoryId] = useState(null)
  const [auditCategoryRef, setAuditCategoryRef] = useState([])
  const [auditCategoryRefId, setAuditCategoryRefId] = useState(null)
  const [company, setCompany] = useState([])
  const [companyId, setCompanyId] = useState(null)

  const [fields, setFields] = useState({
    audit_name: null,
    audit_ref: null,
    audit_category: null,
    audit_location: locationId,
    company: companyId,
    question_uid: questionId
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
      audit_name: fields.audit_name,
      audit_ref: auditCategoryRefId.id,
      audit_category: auditCategoryId.id,
      company: companyId.id,
      audit_location: locationId.id,
      question_uid: questionId.id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/audit-checklist/store', dataForm)
        .then(res => {
          router.push('/audit-checklist')
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
        .post('/web/master/get-dept')
        .then(res => {
          setDepartment(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-question')
        .then(res => {
          setQuestion(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

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

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-company-trans')
        .then(res => {
          setCompany(res.data.data)
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

  async function getCategoryRef() {
    setAuditCategoryRefId(null)

    const dataParam = JSON.stringify({
      key2: auditCategoryId?.id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-audit-category-ref', dataParam)
        .then(res => {
          setAuditCategoryRef(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getCategoryRef()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditCategoryId])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Create Project</Typography>} subtitle={null} />
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
                      {...register('audit_name')}
                      onChange={fieldHandler}
                      fullWidth
                      name='audit_name'
                      label='Project Name'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.audit_name)}
                      helperText={errors.audit_name && errors.audit_name.message}
                    />
                  </Grid>
                  <Grid container item spacing={6}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          size='small'
                          options={company}
                          fullWidth
                          renderInput={params => (
                            <TextField
                              {...params}
                              {...register('company')}
                              label='Company'
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(errors.company)}
                            />
                          )}
                          onChange={(event, newValue) => {
                            setCompanyId(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={companyId}
                        />
                        {errors.company && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.company.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          size='small'
                          options={department}
                          fullWidth
                          renderInput={params => (
                            <TextField
                              {...params}
                              {...register('audit_location')}
                              label='Department'
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(errors.audit_location)}
                            />
                          )}
                          onChange={(event, newValue) => {
                            setLocationId(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={locationId}
                        />
                        {errors.audit_location && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.audit_location.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
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
                              {...register('audit_category')}
                              label='Audit Category'
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(errors.audit_category)}
                            />
                          )}
                          onChange={(event, newValue) => {
                            setAuditCategoryId(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={auditCategoryId}
                        />
                        {errors.audit_category && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.audit_category.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <Autocomplete
                          size='small'
                          options={auditCategoryRef}
                          fullWidth
                          renderInput={params => (
                            <TextField
                              {...params}
                              {...register('audit_ref')}
                              label='Audit Refrence'
                              InputLabelProps={{ shrink: true }}
                              error={Boolean(errors.audit_ref)}
                            />
                          )}
                          onChange={(event, newValue) => {
                            setAuditCategoryRefId(newValue)
                          }}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          value={auditCategoryRefId}
                        />
                        {errors.audit_ref && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.audit_ref.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={question}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('question_uid')}
                            label='Question Template'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.question_uid)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setQuestionId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={questionId}
                      />
                      {errors.question_uid && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.question_uid.message}</FormHelperText>
                      )}
                    </FormControl>
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
                    <Button component={Link} href={'/audit-checklist'} variant='outlined' size='small'>
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
  subject: 'audit-checklist-create'
}

export default AuditIsoCreate
