import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    Grid,
    Button,
    TextField,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { backendApi } from 'src/configs/axios';

const Registration = () => {
    const [data, setData] = useState({
        loading: true,
        rows: [],
        rowCount: 0,
        rowsPerPageOptions: [10, 50, 100],
        pageSize: 10,
        page: 1,
        sort: null,
        filterData: null,
        reload: false
    });

    const [openDialogAdd, setOpenDialogAdd] = useState(false);
    const [dataDelete, setDataDelete] = useState({});
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);

    const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));

    const handleDialogToggleDelete = rowData => {
        setDataDelete(rowData);
        setIsLoadingDelete(false);
        setOpenDialogAdd(!openDialogAdd);
    };

    const handleDialogToggleDeleteClose = () => {
        setIsLoadingDelete(false);
        setOpenDialogAdd(!openDialogAdd);
    };

    const handleFilter = useCallback(val => {
        updateData('filterData', val);
        updateData('page', 1);
    }, []);

    const deleteHandler = e => {
        e.preventDefault();
        setIsLoadingDelete(true);

        const dataForm = JSON.stringify({
            row_id: dataDelete.id
        });

        const myPromise = new Promise((resolve, reject) => {
            backendApi.post('/web/master/item-delete', dataForm)
                .then(res => {
                    resolve('success');
                    handleDialogToggleDeleteClose();
                    updateData('reload', !data.reload);
                })
                .catch(error => {
                    reject(error);
                    handleDialogToggleDeleteClose();
                });
        });

        toast.promise(myPromise, {
            loading: 'Loading',
            success: 'Successfully delete data',
            error: error => {
                if (error.response.status === 500) return error.response.data.response;
                return 'Something error';
            }
        });
    };

    useEffect(() => {
        const initData = async () => {
            updateData('loading', true);

            const dataForm = JSON.stringify({
                limit: data.pageSize,
                page: data.page,
                sort: data.sort,
                filterData: data.filterData
            });

            await backendApi.post('/web/master/item-list', dataForm)
                .then(response => {
                    updateData('rowCount', response.data.total);
                    setTimeout(() => {
                        updateData('rows', response.data.data);
                        updateData('loading', false);
                    }, 100);
                })
                .catch(error => {
                    console.log(error);
                });
        };

        initData();
    }, [data.page, data.pageSize, data.sort, data.filterData, data.reload]);

    const columns = [
        {
            field: 'id',
            flex: 0.25,
            minWidth: 75,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: row => row.id,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>#</Typography>
        },
        {
            flex: 1,
            minWidth: 200,
            field: 'name',
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
        },
        {
            flex: 1,
            minWidth: 200,
            field: 'description',
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Description</Typography>
        },
        {
            flex: 1,
            minWidth: 200,
            field: 'price',
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Price</Typography>
        },
        {
            flex: 0.15,
            minWidth: 115,
            sortable: false,
            filterable: false,
            field: 'actions',
            disableColumnMenu: true,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>,
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton>
                        <Icon icon='mdi:pencil-outline' />
                    </IconButton>
                    <IconButton onClick={() => handleDialogToggleDelete(row)}>
                        <Icon icon='mdi:delete-outline' />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <PageHeader title={<Typography variant='h5'>Registration Item</Typography>} subtitle={null} />
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <Box
                            sx={{
                                p: 5,
                                pb: 3,
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Button sx={{ mb: 2.5 }} component={Link} variant='contained' href='/items/create' size='small'>
                                Create Item
                            </Button>
                            <TextField
                                type='search'
                                size='small'
                                sx={{ mr: 4, mb: 2.5 }}
                                placeholder='Search'
                                onChange={e => handleFilter(e.target.value)}
                            />
                        </Box>
                        <Box sx={{ px: 5 }}>
                            <DataGrid
                                autoHeight
                                rowHeight={40}
                                columns={columns}
                                disableSelectionOnClick
                                disableColumnFilter
                                disableColumnSelector
                                getRowId={row => row.id}
                                loading={data.loading}
                                rows={data.rows}
                                pageSize={data.pageSize}
                                rowsPerPageOptions={data.rowsPerPageOptions}
                                pagination
                                page={data.page - 1}
                                rowCount={data.rowCount}
                                paginationMode='server'
                                onPageChange={newPage => {
                                    updateData('page', newPage + 1);
                                }}
                                onPageSizeChange={newPageSize => {
                                    updateData('page', 1);
                                    updateData('pageSize', newPageSize);
                                }}
                                sortingMode='server'
                                onSortModelChange={newSort => {
                                    updateData('page', 1);
                                    updateData('sort', newSort);
                                }}
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            <Dialog fullWidth onClose={handleDialogToggleDeleteClose} open={openDialogAdd}>
                <DialogTitle sx={{ pt: 6, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant='h5' component='span' sx={{ mb: 2 }}>
                        Are you sure to delete data?
                    </Typography>
                    <Typography variant='body2'>After you delete, you cannot undo this data.</Typography>
                </DialogTitle>
                <DialogContent sx={{ pb: 6, mx: 'auto' }}>
                    <form onSubmit={deleteHandler}>
                        <TableContainer sx={{ mb: 6 }}>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key={dataDelete.id}>
                                        <TableCell>{dataDelete.name}</TableCell>
                                        <TableCell>{dataDelete.description}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
                            <Button size='large' type='submit' variant='contained' color='error' disabled={isLoadingDelete}>
                                Delete
                                {isLoadingDelete && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                            </Button>
                            <Button
                                type='reset'
                                size='large'
                                variant='outlined'
                                color='secondary'
                                onClick={handleDialogToggleDeleteClose}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

Registration.acl = {
    action: 'manage',
    subject: 'registration'
};

export default Registration;
