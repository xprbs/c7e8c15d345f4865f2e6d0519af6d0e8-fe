import { Box, Card, CardContent, CardHeader, Grid, Skeleton, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

const SurveillanceDetail = props => {
  const { detail } = props

  const dtimg = detail.detail.map(d => {
    return (
      <Grid item md={4} xs={12} key={d.id}>
        <Box>
          <img style={{ width: '100%' }} src={process.env.NEXT_PUBLIC_URL_BACKEND_PATH + d.image} alt='img' />
          <Typography variant='h5'>{d.description}</Typography>
          <Typography variant='overline' color={'primary'}>
            <a
              href={'https://www.google.com/maps/search/?api=1&query=' + d.geo_location}
              target='_blank'
              rel='noopener noreferrer'
            >
              Location
            </a>
          </Typography>
        </Box>
      </Grid>
    )
  })

  return (
    <Grid container xs={12} spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={'Data Header'} />
          <CardContent>
            <Grid container xs={12}>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    Company :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.dataAreaId }}></p>
                </Box>
              </Grid>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    Project Number :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.project_number }}></p>
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    Project Name :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.project_name }}></p>
                </Box>
              </Grid>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    PIC Departement :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.project_location }}></p>
                </Box>
              </Grid>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    Due Date :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.due_date }}></p>
                </Box>
              </Grid>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    Project Date :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.project_date }}></p>
                </Box>
              </Grid>
              <Grid item md={3} xs={12}>
                <Box>
                  <Typography variant='overline' color={'primary'}>
                    is SHE :
                  </Typography>
                  <p dangerouslySetInnerHTML={{ __html: detail.is_she }}></p>
                </Box>
              </Grid>
              <hr />
              <Grid container item spacing={6}>
                <Grid item md={6} xs={12}>
                  <Box>
                    <Typography variant='overline' color={'primary'}>
                      Finding :
                    </Typography>
                    <p dangerouslySetInnerHTML={{ __html: detail.finding }}></p>
                  </Box>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Box>
                    <Typography variant='overline' color={'primary'}>
                      Risk :
                    </Typography>
                    <p dangerouslySetInnerHTML={{ __html: detail.risk }}></p>
                  </Box>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Box>
                    <Typography variant='overline' color={'primary'}>
                      Recommendation :
                    </Typography>
                    <p dangerouslySetInnerHTML={{ __html: detail.recommendation }}></p>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={'Data Images'} />
          <CardContent>
            <Grid container item spacing={6}>
              {dtimg}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SurveillanceDetail
