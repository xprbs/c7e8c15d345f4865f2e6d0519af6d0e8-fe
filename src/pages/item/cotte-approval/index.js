import React, { useState, useEffect, useCallback } from 'react';
import {
    Badge,
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
    DialogActions,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Router, { useRouter } from 'next/router';
import { backendApi } from 'src/configs/axios';
import axios from 'axios';
import { fetchProductCategories, getDynamicApiToken } from 'src/helpers/dynamicApi';

const SUJRegistration = () => {
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
    const [openDialogApproval, setOpenDialogApproval] = useState(false);
    const [openDialogReject, setOpenDialogReject] = useState(false);
    const [dataApproval, setDataApproval] = useState({});
    const [rejectReason, setRejectReason] = useState('');
    const [isLoadingApproval, setIsLoadingApproval] = useState(false);
    const [isLoadingReject, setIsLoadingReject] = useState(false);
    const [openDialogCatalogue, setOpenDialogCatalogue] = useState(false);
    const [itemCode, setItemCode] = useState('');
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [typeOptions, setTypeOptions] = useState([]);
    const [token, setToken] = useState(null);
    const [rawTypeOptions, setRawTypeOptions] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [historyData, setDummyDataHistory] = useState([]);

    const getToken = async () => {
        try {
            if (!token) {
                const response = await getDynamicApiToken();
                setToken(response)
                return response
            } else {
                return token;
            }
        } catch (err) {
            console.log('Failed to fetch dynamic api token')
        }
    };

    const fetchType = async (token) => {
        try {
            const response = await fetchProductCategories(token)
            const data = response.raw;

            const uniqueParentCodes = new Set();
            const uniqueData = data.filter(item => {
                if (!uniqueParentCodes.has(item.ParentProductCategoryCode)) {
                    uniqueParentCodes.add(item.ParentProductCategoryCode);
                    return true;
                }
                return false;
            });
            setRawTypeOptions(data);
            return uniqueData;
        } catch (error) {
            console.log('Failed to fetch types', error.message);
        }
    };

    const updateData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }))
    };

    const handleDialogToggleDelete = async (rowData) => {
        setIsLoadingDelete(false);

        try {
            const response = await backendApi.post('/web/log-items', { id_item: rowData.id_item });
            // Set data history ke state
            setDummyDataHistory(response.data); // Update dengan data history yang sebenarnya
        } catch (error) {
            console.error('Failed to fetch history', error);
        }

        setOpenDialogAdd(!openDialogAdd);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleDialogToggleDeleteClose = () => {
        setIsLoadingDelete(false);
        setOpenDialogAdd(false);
    };

    const handleDialogToggleApproval = rowData => {
        setDataApproval(rowData);
        setOpenDialogApproval(true);
    };

    const handleDialogToggleApprovalClose = () => {
        setOpenDialogApproval(false);
    };

    const handleDialogToggleReject = rowData => {
        setDataApproval(rowData);
        setRejectReason('');
        setOpenDialogReject(true);
    };

    const handleDialogToggleRejectClose = () => {
        setOpenDialogReject(false);
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
            backendApi.post('/web/items/delete', dataForm)
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
                if (error.response && error.response.status === 500) return error.response.data.response;
                return 'Something error';
            }
        });
    };

    const handleApproval = async (action) => {
        if (action === 'approve') {
            setOpenDialogCatalogue(true);

            console.log(dataApproval)
            if (dataApproval.dcategory) {
                // console.log('dcategory', dataApproval.dcategory)
                // console.log('parent', dataApproval.ditem_type)

                const typeData = rawTypeOptions;
                const filteredData = typeData.filter(item => item.ParentProductCategoryCode == dataApproval.ditem_type);

                console.log('filtered', filteredData)
                setItemCode(dataApproval.item_code)
                setCategoryOptions(filteredData)
                setSelectedType(dataApproval.ditem_type)
                setSelectedCategory(dataApproval.dcategory)
            }
            return; // Prevent further execution
        }

        setIsLoadingApproval(true);
        const dataForm = JSON.stringify({
            item_id: dataApproval.id_item,
            status_cotte: action === 'approve' ? 1 : 2,
            ...(action === 'reject' && { reject_reason: rejectReason })
        });

        try {
            await backendApi.post('/web/items/approval', dataForm);
            toast.success(`Successfully ${action} data`);
            updateData('reload', !data.reload);
        } catch (error) {
            toast.error(`Failed to process ${action}`);
        } finally {
            setIsLoadingApproval(false);
            handleDialogToggleApprovalClose();
            handleDialogToggleRejectClose();
        }
    };

    const handleUpdateData = async () => {
        updateData('loading', true);

        const dataForm = JSON.stringify({
            limit: data.pageSize,
            page: data.page,
            sort: data.sort,
            filterData: data.filterData
        });

        const res = await backendApi.post('/web/items', dataForm)
        if (res && res.data.code == 200) {
            await Promise.all([
                updateData('rowCount', res.data.total),
                updateData('rows', res.data.data),
                updateData('loading', false),
            ])
        }
    }

    const handleToken = async () => {
        const token = await getToken();
        if (token) {
            setToken(token);
            const type = await fetchType(token);
            setTypeOptions(type);
        }

    }

    useEffect(() => {
        try {
            handleUpdateData()
            handleToken()
        } catch (error) {
            console.log(error)
        }
    }, [data.page, data.reload, data.pageSize, data.sort, data.filterData])

    // useEffect(async () => {
    //     try {

    //         const initData = async () => {
    //             updateData('loading', true);

    //             const dataForm = JSON.stringify({
    //                 limit: data.pageSize,
    //                 page: data.page,
    //                 sort: data.sort,
    //                 filterData: data.filterData
    //             });

    //             await backendApi.post('/web/items', dataForm)
    //                 .then(response => {
    //                     updateData('rowCount', response.data.total);
    //                     setTimeout(() => {
    //                         updateData('rows', response.data.data || []);
    //                         updateData('loading', false);
    //                     }, 100);
    //                 })
    //                 .catch(error => {
    //                     console.log(error);
    //                     updateData('loading', false);
    //                 });

    //         };

    //         const token = await getToken();
    //         if (token) {
    //             setToken(token);
    //             const type = await fetchType(token);
    //             setTypeOptions(type);
    //         }

    //         initData();
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, [data.page, data.pageSize, data.sort, data.filterData, data.reload]);

    const handleTypeChange = async (event) => {
        try {
            const { value } = event.target;
            const data = rawTypeOptions;
            const filteredData = data.filter(item => item.ParentProductCategoryCode === value);
            console.log('selected type', value)
            setSelectedType(value)
            setCategoryOptions(filteredData);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryChange = async (event) => {
        try {
            const { value } = event.target;
            setSelectedCategory(value)
        } catch (error) {
            console.error(error);
        }
    };


    const statusMapping = {
        'Approve': { label: 'Approve', color: 'success' },
        'Reject': { label: 'Reject', color: 'error' },
        'Need Approve': { label: 'Need Approve', color: 'warning' }
    };

    const renderStatusBadge = (params) => {
        const status = statusMapping[params.value] || {};
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
            >
                <Badge
                    badgeContent={status.label || params.value}
                    color={status.color || 'default'}
                    sx={{
                        '& .MuiBadge-badge': {
                            right: 10,
                            fontSize: '0.75rem',
                            height: 20,
                            minWidth: 20
                        }
                    }}
                />
            </Box>
        );
    };

    const columns = [
        {
            field: 'trans_type',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: row => row.trans_type,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Trans Type</Typography>
        },
        {
            field: 'company',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                const companyMapping = {
                    AFD: 'ANF',
                    SUJD: 'SUJ',
                    MSID: 'MSI'
                };
                return companyMapping[params.row.company] || params.row.company;
            },
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Company</Typography>
        },
        {
            field: 'item_code',
            flex: 1,
            minWidth: 120,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Item Code</Typography>
        },
        {
            field: 'item_description',
            flex: 1,
            minWidth: 200,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Item Description</Typography>
        },
        {
            field: 'uom',
            flex: 1,
            minWidth: 70,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>UoM</Typography>
        },
        {
            field: 'status_cotte',
            flex: 1,
            minWidth: 150,
            renderCell: renderStatusBadge,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status COTTE</Typography>
        },
        {
            field: 'status',
            flex: 1,
            minWidth: 150,
            renderCell: renderStatusBadge,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status FICO</Typography>
        },
        {
            field: 'actions',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box display="flex" justifyContent="space-between">
                    <IconButton onClick={() => handleDialogToggleApproval(params.row)}>
                        <Icon icon='mdi:eye-outline' />
                    </IconButton>
                    <IconButton onClick={() => handleDialogToggleDelete(params.row)}>
                        <Icon icon='mdi:history' />
                    </IconButton>
                </Box>
            ),
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>
        }
    ];

    const columnMapping = {
        item_type: 'Item Group',
        uom: 'Uom',
        ditem_type: 'Item Type',
        ditem_category: 'Item Category',
        item_description: 'Description',
        sub_type: 'Sub Type',
        dimension: 'Dimension',
        storage: 'Storage',
        reservation: 'Reservation',
        item_model: 'Item Model',
        product_group: 'Product Group',
        findim: 'Findim'
    };

    const handleSubmitApproval = async (type) => {
        const data = rawTypeOptions;

        setIsLoadingApproval(true)
        const id = dataApproval.id_item;
        let itemForm = null;

        if (type == 'approve') {
            if (!itemCode || !selectedType || !selectedCategory) {
                setIsLoadingApproval(false)
                return alert('Semua kolom wajib di isi')
            }
            const categoryName = data.filter(item => item.ParentProductCategoryCode === selectedType && item.CategoryCode === selectedCategory)[0]['CategoryName'];
            itemForm = JSON.stringify({
                item_code: itemCode,
                ditem_type: selectedType,
                ditem_category: categoryName,
                dcategory: selectedCategory,
                status_cotte: 1,
                status: 3
            })
        } else {
            if (!rejectReason) {
                setIsLoadingApproval(false)
                return alert('Kolom reason wajib di isi')
            }
            itemForm = JSON.stringify({
                status_cotte: 2,
            })
        }




        const logItemForm = JSON.stringify({
            id_item: id,
            type: type == 'approve' ? 'APPROVE COTTE' : 'REJECT COTTE',
            message: type == 'approve' ? '-' : rejectReason
        });

        const promise = new Promise((resolve, reject) => {
            backendApi.post(`/web/items/update/${id}`, itemForm)
                .then((response) => {
                    console.log('success create data')
                })
                .catch((err) => {
                    reject(err)
                }),
                backendApi.post('/web/log-items/create', logItemForm)
                    .then((response) => {
                        // alert('Update data successfully')
                        Router.reload()
                        resolve('success')
                    })
                    .catch((err) => {
                        reject(err)
                    })

        })


        toast.promise(promise, {
            loading: 'Loading',
            success: 'Successfully update data',
            error: error => {
                if (error.response && error.response.status === 500) return error.response.data.response;
                return 'Something error';
            }
        });

        setIsLoadingApproval(false)

        // const response = await backendApi.post('/web/items/update', dataForm)
    }

    return (
        <Grid container spacing={6}>
            <PageHeader
                title={<Typography variant='h5'>Approval COTTE</Typography>}
                subtitle={<Typography variant='body2'>List of all Approval COTTE</Typography>}
            />
            <Grid item xs={12}>
                {/* <Box display="flex" justifyContent="flex-start" paddingBottom={2}>
                    <Link href="/item/suj-registration/form">
                        <Button size="large" variant="contained" style={{ padding: "8px", fontSize: "14px" }}>
                            Create
                        </Button>
                    </Link>
                </Box> */}
                <Card>
                    <Box
                        sx={{
                            p: 5,
                            pb: 3,
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                        }}
                    >
                        {/* <Button sx={{ mb: 2.5 }} component={Link} variant='contained' href='/item/anf-registration/form' size='small'>
                            Create Menu
                        </Button> */}
                        <TextField
                            type={'search'}
                            size='small'
                            sx={{ mr: 4, mb: 2.5 }}
                            placeholder='Search'
                            onChange={e => handleFilter(e.target.value)}
                        />
                    </Box>
                    <DataGrid
                        autoHeight
                        rows={data.rows.length ? data.rows : []}
                        columns={columns}
                        rowCount={data.rowCount}
                        loading={data.loading}
                        page={data.currentPage}
                        pageSize={data.pageSize}
                        pagination
                        paginationMode='server'
                        rowsPerPageOptions={data.rowsPerPageOptions}
                        onPageChange={(currentPage) => updateData('page', currentPage + 1)}
                        onPageSizeChange={newPageSize => updateData('pageSize', newPageSize)}
                        onSortModelChange={newSortModel => updateData('sort', newSortModel[0])}
                        getRowId={(row) => row.id_item} // Ensure unique ID is used
                        components={{
                            LoadingOverlay: () => (
                                <Box
                                    display='flex'
                                    justifyContent='center'
                                    alignItems='center'
                                    height='100%'
                                >
                                    <CircularProgress />
                                </Box>
                            )
                        }}
                    />
                </Card>
            </Grid>
            <Dialog
                open={openDialogAdd}
                onClose={handleDialogToggleDeleteClose}
                aria-labelledby='user-history-dialog-title'
                aria-describedby='user-history-dialog-description'
                maxWidth='md'
                fullWidth
            >
                <DialogTitle id='user-history-dialog-title' sx={{ backgroundColor: '#787EFF', color: '#fff' }}>
                    User Action History
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>By</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyData.map((history, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{history.type}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const date = new Date(history.created_date);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = date.toLocaleString('default', { month: 'long' });
                                                const year = date.getFullYear();
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                const seconds = String(date.getSeconds()).padStart(2, '0');

                                                return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                                            })()}
                                        </TableCell>
                                        <TableCell>{history.created_by}</TableCell>
                                        <TableCell>{history.message}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <Box display='flex' justifyContent='flex-end' padding={2} sx={{ backgroundColor: '#f5f5f5' }}>
                    <Button onClick={handleDialogToggleDeleteClose} color='secondary' variant='outlined'>
                        Close
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={openDialogApproval}
                onClose={handleDialogToggleApprovalClose}
                aria-labelledby='approval-dialog-title'
                aria-describedby='approval-dialog-description'
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id='approval-dialog-title'>Approval</DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="flex-start" mb={2}>
                        <Button
                            onClick={() => handleApproval('approve')}
                            variant="contained"
                            color="primary"
                            disabled={dataApproval.status_cotte == "Approve" || dataApproval.status_cotte == "Reject"}
                            sx={{ marginRight: 1 }}
                            style={{ padding: "1px 10px 1px 2px" }}
                        >
                            <IconButton style={{ size: "10px", color: "#fff" }}>
                                <Icon icon="mdi:check-bold" />
                            </IconButton>
                            Approve
                        </Button>
                        <Button
                            onClick={() => handleDialogToggleReject(dataApproval)}
                            variant="contained"
                            color="error"
                            disabled={dataApproval.status_cotte == "Approve" || dataApproval.status_cotte == "Reject"}
                            style={{ padding: "1px 0px 1px 10px" }}
                        >
                            Reject
                            <IconButton style={{ size: "10px", color: "#fff" }}>
                                <Icon icon="mdi:close" />
                            </IconButton>
                        </Button>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {Object.entries(dataApproval).map(([key, value]) => (
                                    // Menggunakan pemetaan untuk mendapatkan nama kolom yang sesuai
                                    columnMapping[key] ? (
                                        <TableRow key={key}>
                                            <TableCell style={{ border: "1px solid black" }}>
                                                {columnMapping[key]}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }}>
                                                {value}
                                            </TableCell>
                                        </TableRow>
                                    ) : null // Jika tidak ada pemetaan untuk kunci ini, tidak menampilkan baris
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            <Dialog open={openDialogReject} onClose={handleDialogToggleRejectClose}>
                <DialogTitle>Reject Reason</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Reject Reason"
                        fullWidth
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogToggleRejectClose}>Cancel</Button>
                    <Button onClick={() => handleSubmitApproval('reject')} variant='contained' color='error' disabled={isLoadingReject}>
                        {isLoadingReject ? <CircularProgress size={20} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDialogCatalogue}
                onClose={() => setOpenDialogCatalogue(false)}
                aria-labelledby='catalogue-dialog-title'
                aria-describedby='catalogue-dialog-description'
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id='catalogue-dialog-title'>CATALOGUE</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Item Description</TableCell>
                                    <TableCell>{dataApproval.item_description}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Item Code"
                                fullWidth

                                value={itemCode}
                                onChange={(e) => setItemCode(e.target.value)}
                                margin="normal"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name='type'
                                    onChange={(e) => handleTypeChange(e)}
                                    value={selectedType}
                                >
                                    {typeOptions && typeOptions.map(type => (
                                        <MenuItem
                                            key={type.ParentProductCategoryCode}
                                            value={type.ParentProductCategoryCode}
                                        >
                                            {type.ParentProductCategoryName} - {type.ParentProductCategoryCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    name='category'
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    value={selectedCategory}
                                >
                                    {categoryOptions.map(category => (
                                        <MenuItem
                                            key={category.CategoryCode}
                                            value={category.CategoryCode}
                                        >
                                            {category.CategoryName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialogCatalogue(false)} color='primary'>Cancel</Button>
                    <Button onClick={() => handleSubmitApproval('approve')} variant='contained' color='primary'>Submit</Button>
                </DialogActions>
            </Dialog>
        </Grid >
    );
};

SUJRegistration.acl = {
    action: 'manage',
    subject: 'cotte-approval'
};

export default SUJRegistration;
